import java.util.*;

public class WeightedGraph
{
    int numVertices;
    ArrayList<Node> points;

    /*
        Adjacency matrix is symmetric across topleft -> bottom right diagonal

        new int[][]{
            {0},
            {1, 0},
            {0, 1, 0},
            {1, 1, 1, 0},
        }

        is equivalent to

        new int[][]{
            {0, 1, 0, 1},
            {1, 0, 1, 1},
            {0, 1, 0, 1},
            {1, 1, 1, 0}
        }

        and yields v0 connected to v1, v3
        v1 connected to v0, v2, v3
        v2 connected to v1, v3,
        v3 connected to v0,v1, v2.

        The constructor for WeightedGraph accepts either.

     */
    public WeightedGraph(int[][] adjacencyMatrix, ArrayList<Node> vertices) {
        this.numVertices = adjacencyMatrix.length;
        this.points = vertices;

        if (this.numVertices != points.size()) {
            // throw error
            System.out.println("Invalid weighted graph, length of adjacency matrix must" +
                    " equal number of vertices");
            return;
        }

        // convert adjacency matrix to weighted graph

        for (int i = 1; i < numVertices; i++) {
            for (int j = 0; j < adjacencyMatrix[i].length - 1; j++) {
                if (adjacencyMatrix[i][j] != 0) {


                    points.get(i).hasEdgesTo.add(points.get(j));
                    points.get(j).hasEdgesTo.add(points.get(i));
                }
            }
        }
    }

    /*
        getShortestPath uses A* algorithm - guarantee of returning the shortest path
        from source to dest through the given Nodes. Big picture - works just like
        Dijkstra's algorithm, except uses a "heuristic" to make smarter choices. IE,
        the real world is not an abstract weighted graph - so we have some notion of real
        world distance we can leverage.
     */

    public ArrayList<Node> getShortestPath(Node source, Node dest) {
        Comparator<Node> orderingByDistance = Comparator.comparingInt(o -> o.f);
        PriorityQueue<Node> openList = new PriorityQueue<>(orderingByDistance);

        HashSet<Node> closedList = new HashSet<>(numVertices / 2);

        // initialize node properties
        int startG = 0;
        int startH = squaredDistance(source, dest);

        source.parent = null;
        source.setPathFinding(startG, startH);
        openList.add(source);

        while (!openList.isEmpty()) {
            // priority queue is implemented in Java with a flavor of binary heap as the
            // underlying data structure. This gives O(log n) time to both add and
            // remove Nodes. A self-sorting data structure is important here - we need
            // a way to access the "minimum" Node in the openList().
            // If C# doesn't have something like that in its standard library, it is
            // honestly probably important enough to the efficiency of this algorithm
            // that we roll our own.

            Node current = openList.poll(); // return the node with the current smallest
            // lower bound for a path that hasn't been checked yet.

            if (current.equals(dest)) {
                return reconstructPath(current, source);
            }

            closedList.add(current); // don't check this node again - the fastest path
            // can't have backtracking

            for (Node neighbor : current.hasEdgesTo) {

                // O(1) look-up in hash table
                if (!closedList.contains(neighbor)) {
                    // best estimate for lower bound for a path from start to neighbor
                    int tentative =
                            current.g + WeightedGraph.squaredDistance(current,
                                    neighbor);
                    // O(n) time for searching priority Q (there is no guarantee the
                    // underlying tree is balanced)
                    if (!openList.contains(neighbor)) { // add neighbor to be investigated
                        openList.add(neighbor);
                    } else if (tentative >= neighbor.g) { // only continue if this is
                        // the shortest path found from start -> neighbor found so far
                        continue;
                    }

                    neighbor.parent = current; // <- for path reconstruction
                    // lower bound for path from start -> neighbor -> destination is
                    // equal to path from start -> current + current -> neighbor +
                    // estimate from neighbor -> destination.
                    neighbor.setPathFinding(tentative, squaredDistance(neighbor, dest));
                }
            }
        }

        // throw error, no path found
        return new ArrayList<>();
    }

    /*
        After running getShortestPath, we have the following situation:

        source n1 <- n2 <- n3 <- destination, where each Node has an attribute pointing
         to the previous node in the shortest path.
        In other words, it's a singly-linked list, and it's backwards. It also doesn't
        contain the starting node. Reconstruct path returns an ArrayList with the
        Nodes in the order the user should traverse them, starting with the Node
        representing their current location.
     */
    private ArrayList<Node> reconstructPath(Node destination, Node source)
    {
        Stack<Node> path = new Stack<>();
        while (destination.parent != null) {
            path.push(destination);
            destination = destination.parent;
        }
        path.push(source);
        ArrayList<Node> inOrder = new ArrayList<>();
        while (!path.isEmpty()) {
            inOrder.add(path.pop());
        }
        return inOrder;
    }

    @Override
    public String toString()
    {
        StringBuilder s = new StringBuilder();
        for (Node n : points) {
            s.append("(").append(n.coordinatesX).append(", ").append(n.coordinatesY).append(") -> ");
            for (Node m : n.hasEdgesTo) {
                s.append("(").append(m.coordinatesX).append(", ").append(m.coordinatesY).append("), ");
            }
            s.append("\n");
        }
        return s.toString();
    }

    /*
    Temporary distance function - NECESSARY to have lower bound for A* path finding
    algorithm. This function needs
        1. to be consistent - the scale/method remains the same for any two nodes
        2. to respect the triangle inequality |a-c| <= |a-b| + |b-c|
        3. The value returned is a LOWER BOUND on the distance of the actual path we
            provide to the user.
     */
    private static int squaredDistance(Node a, Node b) {
        return (int) ((int) (a.coordinatesX - b.coordinatesX) * (a.coordinatesX - b.coordinatesX) + (a.coordinatesY - b.coordinatesY) * (a.coordinatesY - b.coordinatesY));
    }

    /*
        Need to be converted from lat/lng coords
        Unsure whether we need floats/ints/ etc.
     */
    public static class Node {
        float coordinatesX;
        float coordinatesY;
        ArrayList<Node> hasEdgesTo;

        // private attributes exclusively used for pathFinding algorithm -
        // The variables g, h, and f are named that way because it's what the variables
        // are called in all the literature on the A* algorithm. Makes matching the
        // implementation to the general algorithm easier.
        private int g; // can be thought of as how far this node is
        // from the source
        private int h; // the "heuristic" - a lower bound on how far this node is from the
        // destination based on the squaredDistance fx
        private int f; // g + h => distance from start to this node + estimated
        // distance from this node to the destination = lower bound on the
        // fastest path (found so far) from the start to the destination that passes
        // through this node.
        private Node parent;
        private final int hashCode;

        public Node(float x, float y) {
            this.coordinatesX = x;
            this.coordinatesY = y;

            this.hasEdgesTo = new ArrayList<>();
            this.hashCode = Objects.hash(x, y);
        }

        private void setPathFinding(int g, int h) {
            this.g = g;
            this.h = h;
            this.f = g + h;
        }

        @Override
        public boolean equals(Object obj)
        {
            if (this == obj) {
                return true;
            }
            if (obj == null || getClass() != obj.getClass()) {
                return false;
            }
            Node n = (Node) obj;
            return n.coordinatesX == this.coordinatesX && n.coordinatesY == this.coordinatesY;
        }

        @Override
        public int hashCode()
        {
            return this.hashCode;
        }
    }

    public static void main(String[] args)
    {
        ArrayList<Node> arrayList = new ArrayList<>();
        arrayList.add(new Node(3.0f, 3.0f));
        arrayList.add(new Node(2.0f, 1.0f));
        arrayList.add(new Node(4.0f, 1.0f));
        arrayList.add(new Node(2.0f, 6.0f));

        int[][] edges = new int[][]{
                {0},
                {1, 0},
                {0, 1, 0},
                {1, 1, 1, 0}
        };

        WeightedGraph g = new WeightedGraph(edges, arrayList);
        System.out.println(g + "\n");

        ArrayList<Node> path = g.getShortestPath(arrayList.get(0), arrayList.get(2));
        System.out.println(path.size());
        for (int i = 0; i < path.size(); i++) {
            Node n = path.get(i);
            System.out.printf("%n (%f, %f), %n", n.coordinatesX,
                    n.coordinatesY);
        }


    }
}
