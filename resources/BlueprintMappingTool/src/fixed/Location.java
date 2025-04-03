package fixed;

import javafx.geometry.Point2D;
import javafx.scene.text.Text;
import mapping.OpenLocationCode;
import mapping.Point;

import java.util.ArrayList;

public class Location extends Text
{
        static int STARTING_ID = 3000;
        int id;
        ArrayList<Location> connectedTo;
        ArrayList<Edge> edges;
        String locationCode;
        String type;
        Point GCSCoordinates;
        Point2D fixedPoint;

        public Location(String displayText, String type, Point GCSCoordinates,
                        Point2D fixedPoint) {
            super(displayText);
            this.id = Integer.parseInt(displayText);
            this.type = type;
            this.locationCode = OpenLocationCode.encode(GCSCoordinates.x,
                    GCSCoordinates.y);
            this.GCSCoordinates = GCSCoordinates;
            this.fixedPoint = fixedPoint;
            connectedTo = new ArrayList<>();
            edges = new ArrayList<>();
        }



        public Point2D getFixedPoint() {
            return fixedPoint;
        }
        public Point getGCSCoordinates() {return GCSCoordinates;
        }

        public void markConnection(Location l) {
            connectedTo.add(l);
        }

        public String getType() {
            return type;
        }

        public void addEdge(Edge e) {
            edges.add(e);
        }

        public boolean removeEdge(Edge e) {
            return edges.remove(e);
        }

        public void removeConnection(Location l) {
//            for (fixed.Location loc : this.edges) {
//                if (loc.equals(l)) {
//                    edges.remove(l);
//                }
//            }
            connectedTo.remove(l);
        }

        public ArrayList<Location> getConnectedTo() {
            return connectedTo;
        }

        @Override
        public boolean equals(Object obj)
        {
            if (obj == null) {
                return false;
            }
            if (this == obj) {
                return true;
            }
            if (!(obj instanceof Location)) {
                return false;
            }
            Location l = (Location) obj;

            return l.id == this.id && super.equals(obj);
        }

    public String getLocationCode()
    {
        return locationCode;
    }

    public int getKeyID()
    {
        return id;
    }

    public ArrayList<Edge> getEdges()
    {
        return edges;
    }

    @Override
    public String toString()
    {
        return this.id + " " + this.getLocationCode() + " " + this.GCSCoordinates.x +
                " " + this.GCSCoordinates.y;
    }
}

