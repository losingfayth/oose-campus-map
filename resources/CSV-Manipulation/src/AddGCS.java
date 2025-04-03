import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Scanner;


public class AddGCS
{


    public static void main(String[] args) throws FileNotFoundException
    {
        HashMap<String, Integer> idtoRowMap = new HashMap<>();

        ArrayList<ArrayList<String>> nodeRecords = new ArrayList<>();
        ArrayList<ArrayList<String>> edgeRecords = new ArrayList<>();

        String nodesCSVinPath = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/db/nodes.csv";

        String outPath = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/db" +
                "/nodeUpdated.csv";
        PrintWriter outStream = new PrintWriter(new File(outPath));

        try (Scanner scanner = new Scanner(new File(nodesCSVinPath)))
        {
            while (scanner.hasNextLine())
            {
                ArrayList<String> row = getRecordFromLine(scanner.nextLine());

                nodeRecords.add(row);
            }
        }

        outStream = new PrintWriter(new File(outPath));

        ArrayList<ArrayList<String>> updatedNodeRecords = new ArrayList<>();
        for (int i = 1; i < nodeRecords.size(); i++) {
            ArrayList<String> currentRow = nodeRecords.get(i);
            ArrayList<String> updatedRow = new ArrayList<>(currentRow.size());
            updatedRow.add(currentRow.get(0));
            updatedRow.add(currentRow.get(1));

            if (!currentRow.get(1).toLowerCase(Locale.ROOT).equals("x")) {
                Point p = new Point(currentRow.get(1));
                updatedRow.add(String.valueOf(p.lat));
                updatedRow.add(String.valueOf(p.lng));
            } else {
                updatedRow.add(currentRow.get(2));
                updatedRow.add(currentRow.get(3));
            }
            updatedRow.add(currentRow.get(4));
            updatedRow.add(currentRow.get(5));
            updatedRow.add(currentRow.get(6));
            updatedRow.add(currentRow.get(7));

            updatedNodeRecords.add(updatedRow);
        }

        for (ArrayList<String> list : updatedNodeRecords) {
            for (int i = 0; i < list.size(); i++) {
                System.out.print(list.get(i));
                outStream.print(list.get(i));
                if (i+1 < list.size()) {
                    outStream.print(",");
                    System.out.print(",");
                }
            }
            outStream.print("\n");
            System.out.print("\n");
        }


//        for (ArrayList<String> list : edgeRecords) {
//            for (String s : list) {
//                System.out.printf("%s | ", s);
//            }
//            System.out.println();
//        }


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
