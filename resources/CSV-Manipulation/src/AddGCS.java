import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Scanner;


public class AddGCS
{


    public static void main(String[] args) throws Exception
    {
        String nodesCSVinPath = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map" +
                "/db/csvs/Location.csv";
        String outString = "/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/db" +
                "/csvs/LocationUpdate.csv";

        CSVRecord record = CSVRecord.ReadCSV(nodesCSVinPath);


        // minimize copy paste errors
        for (CSVRecord.CSVRow row : record.rows) {
            String lat = row.get("latitude");
            String lng = row.get("longitude");
            if (lat.charAt(0) == '-') {
                lat = lat.substring(1);
                row.setValue("latitude", lat);
            }
            if (lng.charAt(0) != '-') {
                lng = '-' + lng;
                row.setValue("longitude", lng);
            }
        }

        // add locationCodes
        int it = 0;
        for (CSVRecord.CSVRow row : record.rows) {

            Point p = new Point(Double.parseDouble(row.get("latitude")), Double.parseDouble(row.get(
                    "longitude")));
            String code = OpenLocationCode.encode(p.lat, p.lng, 11);
            if (!code.startsWith("87H52")) {
                throw new Exception("Bad location code: " + code);
            }
            row.setValue("locationCode", code);
            it++;
        }

        System.out.println(record.getCSVFormat());


//    PrintWriter outStream = new PrintWriter(new File(outString));
//    outStream.write(record.getCSVFormat());
//
//    outStream.flush();
//    outStream.close();



    }




}
