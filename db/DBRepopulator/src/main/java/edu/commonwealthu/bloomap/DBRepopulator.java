package edu.commonwealthu.bloomap;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.*;

/**
 * Helper program that nukes every Location node in the database and repopulates it from the nodes and edges CSVs.
 *
 * @author Brandon Ikeler
 */
public class DBRepopulator {
    public static void main(String[] args) {

//        final String dbUri = "neo4j+ssc://apibloomap.xyz:7687";
//        Scanner in = new Scanner(System.in);
//        System.out.print("Enter DB Username: ");
//        String dbUser = in.nextLine().strip();
//        System.out.print("Enter DB Password: ");
//        String dbPass = in.nextLine().strip();
//
//        try (Driver driver = GraphDatabase.driver(dbUri, AuthTokens.basic(dbUser, dbPass))) {
//            driver.verifyConnectivity();
//            System.out.println("Connected to database.");
//        }

        File nodesFile = new File("../csvs/nodes.csv");
        File edgesFile = new File("../csvs/edges.csv");

        ArrayList<Map<String, String>> nodes = CSVParser.readCsv(nodesFile);
        ArrayList<Map<String, String>> edges = CSVParser.readCsv(edgesFile);

    }

    /**
     * Reads a csv file from the specified path and inserts its data in to the returned ArrayList of Maps.
     */
    private static class CSVParser {
        private static ArrayList<Map<String, String>> readCsv(File csv) {
            Scanner csvScanner;
            try {
                csvScanner = new Scanner(csv);
            } catch (FileNotFoundException e) {
                throw new RuntimeException(e);
            }

            String[] csvHeaders = csvScanner.nextLine().split(",");

            ArrayList<Map<String, String>> csvData = new ArrayList<>();
            while (csvScanner.hasNextLine()) {
                Map<String, String> rowEntry = new HashMap<>();

                String[] csvRow = csvScanner.nextLine().split(",");
                assert (csvHeaders.length == csvRow.length);
                for (int i = 0; i < csvRow.length; i++) {
                    rowEntry.put(csvHeaders[i], csvRow[i].trim());
                }

                csvData.add(rowEntry);

            }
            csvScanner.close();
            return addTypeRow(csvData);
        }
    }

    /**
     * Inserts a row at the beginning of the specified ArrayList representing a csv that indicates the data types stored
     * in each column of the csv.
     * For example, if the csv has headers id,locationCode,floor,building,name,isValidDestination, the first entry in
     * csvData will be a Map with the mapping "id" -> "int", "locationCode" -> "string", "floor" -> "double",
     * "building" -> "string", and "isValidDestination" -> "boolean".
     */
    public static ArrayList<Map<String, String>> addTypeRow(ArrayList<Map<String, String>> csvData) {
        // This will never happen for our purposes.
        if (csvData.isEmpty()) {
            csvData.add(new HashMap<String, String>());
            return csvData;
        }

        // Determine all the column names (csv headers).
        Set<String> columns = csvData.getFirst().keySet();

        // Determine the "best" type for each column.
        // Order: int -> double -> boolean -> string.
        Map<String, String> columnTypes = new HashMap<>();
        for (String col : columns) {
            boolean allInt = true;
            boolean allDouble = true;
            boolean allBoolean = true;

            for (Map<String, String> row : csvData) {
                String val = row.get(col);

                // If, for some reason, there is an empty value in a csv row, col entry, just skip trying to determine
                // what type of values are stored in this column.
                if (val == null || val.isEmpty()) {
                    continue;
                }

                // Check whether the value at this position in the csv is an integer, double, or boolean. If it is not
                // one of these, then the column must not store that type. (If it isn't any of these, then the column
                // must be storing strings.)
                try {
                    Integer.parseInt(val);
                } catch (NumberFormatException e) {
                    allInt = false;
                }
                try {
                    Double.parseDouble(val);
                } catch (NumberFormatException e) {
                    allDouble = false;
                }
                if (!val.equalsIgnoreCase("true") && !val.equalsIgnoreCase("false")) {
                    allBoolean = false;
                }
            }

            if (allInt) {
                columnTypes.put(col, "int");
            } else if (allDouble) {
                columnTypes.put(col, "double");
            } else if (allBoolean) {
                columnTypes.put(col, "boolean");
            } else {
                columnTypes.put(col, "string");
            }
        }

        csvData.addFirst(columnTypes);
        return csvData;
    }
}