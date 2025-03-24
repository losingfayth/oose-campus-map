import javafx.scene.text.Text;

import java.util.ArrayList;

public class Location extends Text
{
        static int STARTING_ID = 3000;
        int id;
        ArrayList<Location> edges;
        String locationCode;
        String type;

        public Location(String displayText, String type, String code) {
            super(displayText);
            this.id = STARTING_ID + Integer.parseInt(displayText);
            this.type = type;
            this.locationCode = code;
            edges = new ArrayList<>();
        }

        public void addEdge(Location l) {
            edges.add(l);
        }

        public String getType() {
            return type;
        }

        public void removeEdge(Location l) {
//            for (Location loc : this.edges) {
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

    }

