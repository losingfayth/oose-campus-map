package fixed;

import fixed.Location;

import java.util.ArrayList;

public class LocationGraph
{
    ArrayList<Location> nodes;
    Location currentRoot;

    public LocationGraph() {
        nodes = new ArrayList<>();
    }

    public boolean setCurrentRoot(double cx, double cy) {
        for (Location l : nodes) {
            if (l.contains(cx, cy)) {
                currentRoot = l;
                return true;
            }
        }
        return false;
    }

    public boolean isInGraph(double cx, double cy) {
        for (Location l : nodes) {
            if (l.contains(cx, cy)) {
                return true;
            }
        }
        return false;
    }

    public void setCurrentRoot(Location l) {
        this.currentRoot = l;
    }

    public void addLocation(Location l) {
        nodes.add(l);
    }

    public Location getLocation(double cx, double cy) {
        for (Location l : nodes) {
            if (l.contains(cx, cy)) {
                return l;
            }
        }
        return null;
    }

    public void removeLocation(Location l) {
        nodes.remove(l);
    }

    public Location getCurrentRoot()
    {
        return currentRoot;
    }

    public ArrayList<Location> getNodes()
    {
        return nodes;
    }

    public void fancyPrint()
    {

        getNodes().sort((o1, o2) ->
        {
            if (o1.getType().charAt(0) != o2.getType().charAt(0))
            {
                return o1.getType().charAt(0) - o2.getType().charAt(0);
            }
            return o1.getKeyID() - o2.getKeyID();
        });

        System.out.println("\n***********Nodes************\n");
        String previous = getNodes().get(0).getType();
        System.out.println("\n" + previous + "\n");
        for (Location l : getNodes()) {
            if (!l.getType().equals(previous)) {
                previous = l.getType();
                System.out.println("\n"+previous+"\n");
            }
            System.out.println(l.getKeyID() + " " + l.getLocationCode());
        }

        System.out.println("********\nTotal # of nodes: " + getNodes().size() + " **********\n");

        System.out.println("\n***********Edges************\n");
        int tot = 0;
        for (Location l : getNodes()) {
            int n1 = l.getKeyID();
            for (Location to : l.getEdges()) {
                tot++;
                System.out.printf("%n%d %d", n1, to.getKeyID());
            }
        }
        System.out.println("\nTotal # of Edges: " + tot);
    }
}
