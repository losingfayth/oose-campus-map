package edu.commonwealthu.bloomap;

import org.neo4j.driver.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Helper program that nukes every Location node in the database and repopulates it from the nodes and edges CSVs.
 *
 * @author Brandon Ikeler
 */
public class DBRepopulator {
    public static void main(String[] args) {

        // Retrieve username and password from user to log into the database.
        final String dbUri = "neo4j+ssc://apibloomap.xyz:7687";
        final String dbUser = System.getenv("DB_USER");
        final String dbPass = System.getenv("DB_PASSWORD");
        if (dbUser == null || dbPass == null) {
            throw new RuntimeException("Environment variables DB_USER and/or DB_PASSWORD are not set.");
        }

        // Read the csvs from which the database will be repopulated.
        final File nodesFile = new File("../csvs/nodes.csv");
        final File edgesFile = new File("../csvs/edges.csv");
        final ArrayList<Map<String, String>> nodes = CSVParser.readCsv(nodesFile);
        final ArrayList<Map<String, String>> edges = CSVParser.readCsv(edgesFile);

        // Attempt to connect to the database; if successful, run the nuke and repopulation methods.
        long startTime = 0;
        try (Driver driver = GraphDatabase.driver(dbUri, AuthTokens.basic(dbUser, dbPass))) {
            driver.verifyConnectivity();
            System.out.println("Connected to database as user " + dbUser + ".\n" +
                    "Beginning repopulation...");
            try (Session session = driver.session()) {
                startTime = System.nanoTime();

                session.executeWrite(tx -> {
                    removeAllLocations(tx);
                    insertNodes(tx, nodes);
                    insertEdges(tx, edges);
                    return null;
                });
            }
        } catch (Exception e) {
            System.err.println("An error prevented database repopulation. The database remains unmodified.\n" +
                    "See the error below:");
            e.printStackTrace();
        }

        long endTime = System.nanoTime();
        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
        System.out.printf("Database successfully repopulated in %.2f seconds.%n", durationSeconds);
    }

    /**
     * Removes all Location nodes in the database.
     */
    private static void removeAllLocations(TransactionContext tx) {
        long startTime = System.nanoTime();

        tx.run("MATCH (n:Location) DETACH DELETE n");

        long endTime = System.nanoTime();
        double durationMillis = (endTime - startTime) / 1_000_000.;
        System.out.printf("All Location nodes removed in %.2f milliseconds.%n", durationMillis);

    }

    /**
     * Inserts nodes into the database.
     * The nodes parameter contains a type row at index 0 and the actual node data in subsequent rows.
     */
    private static void insertNodes(TransactionContext tx, ArrayList<Map<String, String>> nodes) {
        long startTime = System.nanoTime();

        // This will never happen for our purposes.
        if (nodes.size() < 2) {
            System.out.println("No node data found.");
            return;
        }

        // First row contains type mapping.
        Map<String, String> types = nodes.getFirst();

        // Process each node row.
        for (int i = 1; i < nodes.size(); i++) {
            Map<String, String> row = nodes.get(i);
            Map<String, Object> params = new HashMap<>();
            for (String key : row.keySet()) {
                String type = types.get(key);
                String value = row.get(key);
                params.put(key, convertValue(value, type));
            }

            // Build query dynamically and execute it.
            String props = params.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:Location {" + props + "})";
            tx.run(query, params);
        }

        long endTime = System.nanoTime();
        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
        System.out.printf("Nodes inserted in %.2f seconds.%n", durationSeconds);
    }

    /**
     * Helper method that converts a String value to an Object based on the provided type.
     * Supported types are int, double, boolean, and string.
     */
    private static Object convertValue(String value, String type) {
        return switch (type.toLowerCase()) {
            case "int" -> Integer.parseInt(value);
            case "double" -> Double.parseDouble(value);
            case "boolean" -> Boolean.parseBoolean(value);
            default -> value;
        };
    }

    /**
     * Inserts edges and creates symmetric CONNECTED_TO relationships.
     * The edges parameter contains a type row at index 0 and the actual edge data in subsequent rows.
     * Each row must include startId and endId. Other keys become relationship properties.
     */
    public static void insertEdges(TransactionContext tx, ArrayList<Map<String, String>> edgesCsv) {
        long startTime = System.nanoTime();

        if (edgesCsv.size() < 2) {
            System.out.println("No edge data found.");
            return;
        }

        // First row contains type mapping.
        Map<String, String> types = edgesCsv.getFirst();

        for (int i = 1; i < edgesCsv.size(); i++) {
            Map<String, String> row = edgesCsv.get(i);
            Map<String, Object> params = new HashMap<>();
            // Convert all values using the type mapping.
            for (String key : row.keySet()) {
                String type = types.get(key);
                String value = row.get(key);
                params.put(key, convertValue(value, type));
            }
            // Ensure startId and endId are provided.
            if (!params.containsKey("startId") || !params.containsKey("endId")) {
                throw new RuntimeException("Edge row missing startId or endId: " + row);
            }

            // Build relationship property string for additional attributes.
            List<String> relProps = params.keySet().stream()
                    .filter(k -> !k.equals("startId") && !k.equals("endId"))
                    .map(k -> k + ": $" + k)
                    .collect(Collectors.toList());
            String relPropsString = relProps.isEmpty() ? "" : " {" + String.join(", ", relProps) + "}";

            // Create symmetric relationships.
            String query = "MATCH (a:Location {id: $startId}), (b:Location {id: $endId}) " +
                    "CREATE (a)-[:CONNECTED_TO" + relPropsString + "]->(b), " +
                    "(b)-[:CONNECTED_TO" + relPropsString + "]->(a)";
            tx.run(query, params);
        }

        long endTime = System.nanoTime();
        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
        System.out.printf("Edges inserted in %.2f seconds.%n", durationSeconds);
    }

    /**
     * Helper class with static methods used to read the csv files into memory so that they may be inserted into the
     * database.
     *
     * @author Brandon Ikeler
     */
    private static class CSVParser {
        /**
         * Reads a csv file from the specified path and inserts its data in to the returned ArrayList of Maps.
         */
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

        /**
         * Inserts a row at the beginning of the specified ArrayList representing a csv that indicates the data types
         * stored in each column of the csv.
         * For example, if the csv has headers id,locationCode,floor,building,name,isValidDestination, the first entry
         * in csvData will be a Map with the mapping "id" -> "int", "locationCode" -> "string", "floor" -> "double",
         * "building" -> "string", and "isValidDestination" -> "boolean".
         */
        public static ArrayList<Map<String, String>> addTypeRow(ArrayList<Map<String, String>> csvData) {
            // This will never happen for our purposes.
            if (csvData.isEmpty()) {
                csvData.add(new HashMap<>());
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

                    // If, for some reason, there is an empty value in a csv row, col entry, just skip trying to
                    // determine what type of values are stored in this column.
                    if (val == null || val.isEmpty()) {
                        continue;
                    }

                    // Check whether the value at this position in the csv is an integer, double, or boolean. If it is
                    // not one of these, then the column must not store that type. (If it isn't any of these, then the
                    // column must be storing strings.)
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
}