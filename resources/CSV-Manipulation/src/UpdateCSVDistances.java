import java.io.File;
import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Scanner;


public class UpdateCSVDistances
{
    private static int AVG_MPH_WALKING_SPEED = 3;
    private static int STAIRWELL_TRAVERSAL_TIME = 20;
    private static double STAIRWELL_SLOWING_FACTOR = 1.2;
    private static double EARTH_RADIUS_MILES = 3963.1;
    private static int SECONDS_PER_HOUR = 3600;

    public static void main(String[] args) throws FileNotFoundException
    {
        HashMap<String, Integer> idtoRowMap = new HashMap<>();

        ArrayList<ArrayList<String>> nodeRecords = new ArrayList<>();
        ArrayList<ArrayList<String>> edgeRecords = new ArrayList<>();

        String nodesCSVinPath = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/db/nodes.csv";
        String edgesCSVinPath = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map" +
                "/db/edges.csv";
        String outPath = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/db" +
                "/edgesUpdated.csv";
        PrintWriter outStream = new PrintWriter(new File(outPath));

        try (Scanner scanner = new Scanner(new File(nodesCSVinPath)))
        {
            while (scanner.hasNextLine())
            {
                ArrayList<String> row = getRecordFromLine(scanner.nextLine());
                for (int i = 0; i < row.size(); i++) {
                    outStream.print(row.get(i));
                    if (i + 1 < row.size()) {
                        outStream.print(",");
                    }
                }
                idtoRowMap.put(row.get(0), nodeRecords.size());
                nodeRecords.add(row);
            }
        }

        System.out.println(nodeRecords.get(idtoRowMap.get("3001")));

        try (Scanner scanner = new Scanner(new File(edgesCSVinPath))) {
            while (scanner.hasNextLine()) {
                ArrayList<String> row = getRecordFromLine(scanner.nextLine());
                edgeRecords.add(row);
            }
        }

//        System.out.println(nodeRecords.get(idtoRowMap.get("153")));
//        System.out.println(nodeRecords.get(idtoRowMap.get("167")));
        System.out.println(edgeRecords.size());
        for (int i = 1; i < edgeRecords.size(); i++) {
            ArrayList<String> row = edgeRecords.get(i);
            if (row.get(2).equals("1")) {
                ArrayList<String> n1 = nodeRecords.get(idtoRowMap.get(row.get(0)));
                ArrayList<String> n2 = nodeRecords.get(idtoRowMap.get(row.get(1)));

                if (!(n1.get(1).equals("x") || n2.get(1).equals("x"))) {
//                    printList(n1);
//                    printList(n2);
                    row.set(2, String.valueOf(calculateTravelTime(n1, n2)));

                }
            }
        }
        System.out.println(edgeRecords.size());

//        outStream = new PrintWriter(new File(outPath));
//        for (ArrayList<String> list : edgeRecords) {
//            for (int i = 0; i < list.size(); i++) {
//                System.out.print(list.get(i));
//                outStream.print(list.get(i));
//                if (i+1 < list.size()) {
//                    outStream.print(",");
//                    System.out.print(",");
//                }
//            }
//            outStream.print("\n");
//            System.out.print("\n");
//        }


//        for (ArrayList<String> list : edgeRecords) {
//            for (String s : list) {
//                System.out.printf("%s | ", s);
//            }
//            System.out.println();
//        }


    }

    private static int calculateTravelTime(ArrayList<String> n1, ArrayList<String> n2)
    {
        Point p1 = new Point(n1.get(1));
        Point p2 = new Point(n2.get(1));
        int travelTime = 0;

        int floorChange = floorChange(n1, n2);
        
        if (floorChange != 0) {
            for (int i = 0; i < floorChange; i++) {
                travelTime += Math.floor(STAIRWELL_TRAVERSAL_TIME * ((Math.pow(STAIRWELL_SLOWING_FACTOR, i))));
            }
        } 
        
        return (int) Math.floor((travelTime + (distance(p1, p2) / AVG_MPH_WALKING_SPEED) * SECONDS_PER_HOUR));
    }

    private static double distance(Point p1, Point p2)
    {
        double deltaLng = degreeToRadians(p1.lng) - degreeToRadians(p2.lng);
        double deltaLat = degreeToRadians(p1.lat) - degreeToRadians(p2.lat);
        double a =
                Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(p1.lat) * Math.cos(p2.lat) * Math.pow(Math.sin(deltaLng / 2), 2);

        return EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
    }

    private static double degreeToRadians(double degrees) {
        return degrees * Math.PI / 180;
    }

    private static int floorChange(ArrayList<String> n1, ArrayList<String> n2)
    {
        return (int) Math.floor(Double.parseDouble(n1.get(2)) - Double.parseDouble(n2.get(2)));
    }


    private static class Point {
        double lat, lng;

        public Point(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public Point(String openLocationCode) {
            this.lat = (OpenLocationCode.decode(openLocationCode).getCenterLatitude());
            this.lng = OpenLocationCode.decode(openLocationCode).getCenterLongitude();
        }
    }

    private static void printList(ArrayList<String> n1)
    {
        for (String s : n1) {
            System.out.printf("%s | ",s);
        }
        System.out.println();
    }


    private static ArrayList<String> getRecordFromLine(String line)
    {
        ArrayList<String> values = new ArrayList<String>();
        try (Scanner rowScanner = new Scanner(line))
        {
            rowScanner.useDelimiter(",");
            while (rowScanner.hasNext())
            {
                values.add(rowScanner.next());
            }
        }
        return values;
    }
}
