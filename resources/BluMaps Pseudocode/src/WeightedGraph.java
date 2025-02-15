import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.Stack;

public class WeightedGraph
{
    int numVertices;
    ArrayList<Node> points;
    List<List<int[]>> weightedConnections;

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


        weightedConnections = new ArrayList<>(numVertices);

        for (int i = 0; i < numVertices; i++) {
            weightedConnections.add(new ArrayList<>());
        }

        for (int i = 1; i < numVertices; i++) {
            for (int j = 0; j < adjacencyMatrix[i].length - 1; j++) {
                if (adjacencyMatrix[i][j] != 0) {
                    int d = squaredDistance(vertices.get(i), vertices.get(j));
                    weightedConnections.get(j).add(new int[]{i, d});
                    weightedConnections.get(i).add(new int[]{j, d});

                    points.get(i).hasEdgesTo.add(points.get(j));
                    points.get(j).hasEdgesTo.add(points.get(i));
                }
            }
        }
    }

    public ArrayList<Node> getShortestPath(Node source, Node dest) {
        ArrayList<Node> openList = new ArrayList<>();
        ArrayList<Node> closedList = new ArrayList<>();

        // initialize node properties
        int startG = 0;
        int startH = squaredDistance(source, dest);
        source.parent = null;

        source.setPathFinding(startG, startH);
        openList.add(source);

        while (!openList.isEmpty()) {
            //priority queue implementation
            Node current = getMin(openList);

            if (current.equals(dest)) {
                return reconstructPath(current, source);
            }

            openList.remove(current);
            closedList.add(current);

            for (Node neighbor : current.hasEdgesTo) {
                if (!closedList.contains(neighbor)) {
                    int tentative =
                            current.g + WeightedGraph.squaredDistance(current,
                                    neighbor);
                    if (!openList.contains(neighbor)) {
                        openList.add(neighbor);
                    } else if (tentative >= neighbor.g) {
                        continue;
                    }

                    neighbor.parent = current;
                    neighbor.setPathFinding(tentative, squaredDistance(neighbor, dest));

                }
            }
        }

        // throw error, no path found
        return new ArrayList<>();
    }

    private ArrayList<Node> reconstructPath(Node current, Node source)
    {
        Stack<Node> path = new Stack<>();
        while (current.parent != null) {
            path.push(current);
            current = current.parent;
        }
        path.push(source);
        ArrayList<Node> inOrder = new ArrayList<>();
        while (!path.isEmpty()) {
            inOrder.add(path.pop());
        }
        return inOrder;
    }



    private Node getMin(ArrayList<Node> openList)
    {
        int minF = Integer.MAX_VALUE;
        Node best = openList.get(0);
        for (int i = 0; i < openList.size(); i++) {
            if (openList.get(i).f < minF) {
                best = openList.get(i);
                minF = openList.get(i).f;
            }
        }
        return best;
    }

    @Override
    public String toString()
    {
        StringBuilder s = new StringBuilder();
        for (int i = 0; i < weightedConnections.size(); i++) {
            s.append(i).append("-> ");
            for (int j = 0; j < weightedConnections.get(i).size(); j++) {
                s.append("(").append(weightedConnections.get(i).get(j)[0]).append(", ").append(weightedConnections.get(i).get(j)[1]).append(") ");
            }
            s.append("\n");
        }
        return s.toString();
    }

    /*
    Temporary distance function - NECESSARY to have lower bound for A* path finding
    algorithm.
     */
    private static int squaredDistance(Node a, Node b) {
        return (int) ((int) (a.coordinatesX - b.coordinatesX) * (a.coordinatesX - b.coordinatesX) + (a.coordinatesY - b.coordinatesY) * (a.coordinatesY - b.coordinatesY));
    }




    /*
        Need to be converted from lat/lng coords
     */
    private static class Node {
        float coordinatesX;
        float coordinatesY;
        ArrayList<Node> hasEdgesTo;
        private int g;
        private int h;
        private int f;
        private Node parent;

        public Node(float x, float y) {
            this.coordinatesX = x;
            this.coordinatesY = y;

            this.hasEdgesTo = new ArrayList<>();
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
