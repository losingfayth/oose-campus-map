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
}
