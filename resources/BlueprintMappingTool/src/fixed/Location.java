package fixed;

import javafx.geometry.Point2D;
import javafx.scene.text.Text;

import java.util.ArrayList;

public class Location extends Text
{
        static int STARTING_ID = 3000;
        int id;
        ArrayList<Location> edges;
        String locationCode;
        String type;
        Point2D fixedPoint;

        public Location(String displayText, String type, String code,
                        Point2D fixedPoint) {
            super(displayText);
            this.id = STARTING_ID + Integer.parseInt(displayText);
            this.type = type;
            this.locationCode = code;
            this.fixedPoint = fixedPoint;
            System.out.println("Location fixedPoint: " + fixedPoint.getX() + ", " + fixedPoint.getY());
            edges = new ArrayList<>();
        }

        public Point2D getFixedPoint() {
            return fixedPoint;
        }

        public void addEdge(Location l) {
            edges.add(l);
        }

        public String getType() {
            return type;
        }

        public void removeEdge(Location l) {
//            for (fixed.Location loc : this.edges) {
//                if (loc.equals(l)) {
//                    edges.remove(l);
//                }
//            }
            edges.remove(l);
        }

        public ArrayList<Location> getEdges() {
            return edges;
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
}

