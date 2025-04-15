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
    private static final int HOW_MANY_FEET_IS_ONE_FLIGHT_OF_STAIRS_WORTH_APPROXIMATION_ID_SAY = 50;
    private static final double HOW_MANY_FEET_PER_MILE = 5280.0;
    private static final double EARTH_RADIUS_MILES = 3963.1;


    public static void main(String[] args) throws Exception
    {
        HashMap<String, Integer> idToPoint = new HashMap<>();

        ArrayList<ArrayList<String>> nodeRecords = new ArrayList<>();

        String relativePath = "../..";
        String nodesCSVinPath = relativePath + "/db/csvs/Location.csv";
        String edgesCSVinPath = relativePath + "/db/csvs/CONNECTED_TO.csv";
        String outPath = relativePath + "/db/csvs/CONNECTED_TO_Updated.csv";

        CSVRecord locationRecords = CSVRecord.ReadCSV(nodesCSVinPath);
        CSVRecord edgeRecords = CSVRecord.ReadCSV(edgesCSVinPath);

        for (int i = 0; i < locationRecords.rows.size(); i++) {
            if (idToPoint.containsKey(locationRecords.rows.get(i).get("id"))) {
                throw new Exception("at row " + i + " duplicate id: " + locationRecords.rows.get(i).get("id") + " found");
            }
            idToPoint.put(locationRecords.rows.get(i).get("id"), i);

        }
// startId	endId	distance
        CSVRecord updatedEdges = new CSVRecord(edgeRecords.getColumnHeaders());

        for (int i = 0; i < edgeRecords.rows.size(); i++) {
            CSVRecord.CSVRow currRow = edgeRecords.rows.get(i);
            String startID = currRow.get("startId");
            String endID = currRow.get("endId");
            System.out.printf("%d | %s -> %s | ", i, startID, endID);

            if (i + 1 < edgeRecords.rows.size()) {
                CSVRecord.CSVRow nextRow = edgeRecords.rows.get(i+1);
                if ((startID.equals(nextRow.get("endId")) && endID.equals(nextRow.get(
                        "startId")))) {
                    continue;
                }
            }

            int startIndex = idToPoint.get(startID);
            int endIndex = idToPoint.get(endID);
            System.out.printf(" %d -> %d = ", startIndex, endIndex);
            double distanceInNauticalMiles =
                    calculateDistance(locationRecords.rows.get(startIndex),
                    locationRecords.rows.get(endIndex));
            System.out.printf("%f%n", distanceInNauticalMiles);
            currRow.setValue("distance", String.valueOf(distanceInNauticalMiles));
            updatedEdges.addRow(currRow);
        }


        PrintWriter outStream = new PrintWriter(new File(outPath));
        outStream.print(updatedEdges.getCSVFormat());
        outStream.flush();
        outStream.close();

        System.out.println(updatedEdges.getCSVFormat());


    }

    private static double calculateDistance(CSVRecord.CSVRow locStart,
                                            CSVRecord.CSVRow locEnd)
    {
        double distance = distance(pointFromRow(locStart), pointFromRow(locEnd));
        if (locStart.get("areaId").equals("10") || locStart.get("floor").equals(locEnd.get("floor"))) {
            return distance;
        } else { // then we're inside and changing floors
            double floorsChanged = Math.abs(
                    Double.parseDouble(locStart.get("floor")) - Double.parseDouble(locEnd.get("floor")));
            distance += floorsChanged * HOW_MANY_FEET_IS_ONE_FLIGHT_OF_STAIRS_WORTH_APPROXIMATION_ID_SAY / HOW_MANY_FEET_PER_MILE;
            return distance;
        }
    }

    private static Point pointFromRow(CSVRecord.CSVRow row) {
        return new Point(Double.parseDouble(row.get("latitude")),
                Double.parseDouble(row.get("longitude")));
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

}
