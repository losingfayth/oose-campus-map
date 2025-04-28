package edu.commonwealthu.bloomap;

import org.neo4j.driver.*;
import reactor.util.function.Tuple2;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Helper program that nukes all the Location and Area nodes in the database and repopulates them (and their edges) from
 * the CSV files we've been working with.
 * This program expects the following files with the following names:
 * Location.csv (storing the information that Location nodes will hold)
 * CONNECTED_TO.csv (storing the edges between Location nodes)
 * Area.csv (storing the names of the buildings around campus, like Ben Franklin)
 * Some of the code duplication is intentional. For example, insertLocations and insertAreas are very similar. My design
 * philosophy for this program is that each query used to populate the database has exactly one unique Java method
 * associated with it.
 */
public class DBRepopulator {
    public static void main(String[] args) throws FileNotFoundException {
        final String dbUri = "neo4j+ssc://apibloomap.xyz:7687";
        final String dbUser = System.getenv("DB_USER");
        final String dbPass = System.getenv("DB_PASSWORD");
        if (dbUser == null || dbPass == null) {
            throw new RuntimeException("Environment variables DB_USER and/or DB_PASSWORD are not set.");
        }

        final File locationFile = new File("../csvs/Location.csv");
        final File connectedToFile = new File("../csvs/CONNECTED_TO.csv");
        final File areaFile = new File("../csvs/Area.csv");
        final CSV locations = new CSV(locationFile);
        final CSV connections = new CSV(connectedToFile);
        final CSV areas = new CSV(areaFile);

        runTests(locations, connections, areas);

        File file = new File("../csvs/Location2.csv");
        Scanner scanner = new Scanner(file);
        File newFile = new File("../csvs/Location3.csv");
        try (PrintWriter printWriter = new PrintWriter(newFile)) {
            printWriter.write("id,locationCode,latitude,longitude,floor,areaId,name,isValidDestination");
            printWriter.write(scanner.nextLine());
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                int id = Integer.parseInt(line.split(",")[0]);
                int floor = getFloor(id);
                printWriter.print("\n" + line + "," + floor);
            }
        }

//        long startTime;
//        try (Driver driver = GraphDatabase.driver(dbUri, AuthTokens.basic(dbUser, dbPass))) {
//            driver.verifyConnectivity();
//            System.out.println("Connected to database as user " + dbUser + ".\n" +
//                    "Beginning repopulation...\n");
//            try (Session session = driver.session()) {
//                startTime = System.nanoTime();
//
//                session.executeWrite(tx -> {
//                    executeLabeledAndTimed(() -> nuke(tx), "Removing all Location and Area nodes...");
//                    executeLabeledAndTimed(() -> insertLocations(tx, locations), "Inserting Location nodes...");
//                    executeLabeledAndTimed(() -> insertAreas(tx, areas), "Inserting Area nodes...");
//                    executeLabeledAndTimed(() -> createConnectedTo(tx, connections),
//                            "Creating CONNECTED_TO relationships...");
//                    executeLabeledAndTimed(() -> createIsIn(tx, locations), "Creating IS_IN relationships...");
//                    return null;
//                });
//            }
//        } catch (Exception e) {
//            System.err.println("An error prevented database repopulation. The database remains unmodified.\n" +
//                    "See the error below:");
//            e.printStackTrace();
//            return;
//        }
//
//        long endTime = System.nanoTime();
//        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
//        System.out.printf("Database successfully repopulated in %.2f seconds.%n", durationSeconds);
    }

    /**
     * Dumb brute force assignment for floor numbers because I can't be bothered to type the floor number 3.5 thousand
     * times.
     * @param id the id of the (indoor) location.
     * @return the floor number that this location is on, or 999 if it is a stair and must be determined manually.
     */
    private static int getFloor(int id) {
        if (id <= 82) { // A&A 0
            if (id < 2 || id > 6) return 0;
            else return 999;
        } else if (id <= 264) { // A&A 1
            if (id < 85 || id > 89) return 1;
            else return 999;
        } else if (id <= 455) { // A&A 2
            if (id < 265 || id > 267) return 2;
            else return 999;
        } else if (id <= 596) { // A&A 3
            return 3;
        } else if (id <= 618) { // BCH 0
            if (id != 598) return 0;
            else return 999;
        } else if (id <= 740) { // BCH 1
            if (id < 623 || id > 628) return 1;
            else return 999;
        } else if (id <= 835) { // BCH 2
            if (id < 741 || id > 744) return 2;
            else return 999;
        } else if (id <= 917) { // BCH 3
            return 3;
        } else if (id <= 961) { // BFH 0
            if (id < 920 || id > 923) return 0;
            else return 999;
        } else if (id <= 1017) { // BFH 1
            if (id < 963 || id > 965) return 1;
            else return 999;
        } else if (id <= 1100) { // BFH 2
            return 2;
        } else if (id <= 1288) { // CH 1
            if (id < 1113 || id > 1120) return 1;
            else return 999;
        } else if (id <= 1387) { // CH 2
            if (id < 1289 || id > 1290) return 2;
            else return 999;
        } else if (id <= 1482) { // CH 3
            return 3;
        } else if (id <= 1592) { // HSC -1
            if (id < 1484 || id > 1487) return -1;
            else return 999;
        } else if (id <= 1806) { // HSC 0
            if (id < 1598 || id > 1607) return 0;
            else return 999;
        } else if (id <= 2011) { // HSC 1
            if (id < 1809 || id > 1815) return 1;
            else return 999;
        } else if (id <= 2168) { // HSC 2
            return 2;
        } else if (id <= 2233) { // LIB 1
            if (id < 2172 || id > 2174) return 1;
            else return 999;
        } else if (id <= 2323) { // LIB 2
            if (id < 2234 || id > 2236) return 2;
            else return 999;
        } else if (id <= 2423) { // LIB 3
            if (id < 2324 || id > 2326) return 3;
            else return 999;
        } else if (id <= 2474) { // LIB 4
            return 4;
        } else if (id <= 2542) { // NH 0
            if (id < 2477 || id > 2480) return 0;
            else return 999;
        } else if (id <= 2619) { // NH 1
            if (id < 2544 || id > 2546) return 1;
            else return 999;
        } else if (id <= 2667) { // NH 2
            return 2;
        } else if (id <= 2721) { // SH 1
            if (id < 2669 || id > 2671) return 1;
            else return 999;
        } else if (id <= 2838) { // SH 2
            if (id < 2722 || id > 2725) return 2;
            else return 999;
        } else if (id <= 2993) { // SH 3
            return 3;
        } else if (id <= 3113) { // SSC 0
            if (id < 2995 || id > 3000) return 0;
            else return 999;
        } else if (id <= 3246) { // SSC 1
            if (id < 3115 || id > 3119) return 1;
            else return 999;
        } else { // SSC 2
            return 2;
        }
    }

    /**
     * Runs the specified task after printing the specified string. The task is timed, and at its successful conclusion,
     * the duration in seconds that it took for the task to complete is printed.
     */
    private static void executeLabeledAndTimed(Runnable task, String startMessage) {
        if (startMessage != null) {
            System.out.println(startMessage);
        }

        long startTime = System.nanoTime();

        task.run();

        long endTime = System.nanoTime();
        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
        System.out.printf("Operation completed in %.2f seconds.%n%n", durationSeconds);
    }

    /**
     * Removes all Location and Area nodes in the database.
     */
    private static void nuke(TransactionContext tx) {
        tx.run("MATCH (n) WHERE n:Location OR n:Area DETACH DELETE n");
    }

    /**
     * Uses the locations CSV to populate the database with Location nodes.
     */
    private static void insertLocations(TransactionContext tx, CSV locations) {
        if (locations.isEmpty()) {
            throw new RuntimeException("No Locations found.");
        }

        for (int i = 0; i < locations.size(); i++) {
            Map<String, Object> row = locations.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:Location {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * Uses the areas CSV to populate the database with Area nodes.
     */
    private static void insertAreas(TransactionContext tx, CSV areas) {
        if (areas.isEmpty()) {
            throw new RuntimeException("No Areas found.");
        }

        for (int i = 0; i < areas.size(); i++) {
            Map<String, Object> row = areas.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:Area {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * Uses the connectedTo CSV to populate the database with CONNECTED_TO relations between Location nodes.
     * This method assumes that the connectedTo CSV has headers startId and endId, whose entries contain integer type
     * values referring to the Location nodes that should have the relation.
     * The relation is symmetric; if Location node a is CONNECTED_TO Location node b, then b is also CONNECTED_TO a.
     */
    private static void createConnectedTo(TransactionContext tx, CSV connectedTo) {
        if (connectedTo.isEmpty()) {
            throw new RuntimeException("No CONNECTED_TO relations found.");
        }

        if (!connectedTo.containsColumn("startId") || !connectedTo.containsColumn("endId")) {
            throw new RuntimeException("CONNECTED_TO.csv missing startId or endId columns.");
        }
        if (!connectedTo.getColumnType("startId").equals("int")
                || !connectedTo.getColumnType("endId").equals("int")) {
            throw new RuntimeException("CONNECTED_TO.csv data malformed; ensure startId and endId are all integers.");
        }

        for (int i = 0; i < connectedTo.size(); i++) {
            Map<String, Object> row = connectedTo.getRow(i);

            List<String> relProps = row.keySet().stream()
                    .filter(k -> !k.equals("startId") && !k.equals("endId"))
                    .map(k -> k + ": $" + k)
                    .collect(Collectors.toList());
            String relPropsString = relProps.isEmpty() ? "" : " {" + String.join(", ", relProps) + "}";

            String query = "MATCH (a:Location {id: $startId}), (b:Location {id: $endId}) " +
                    "CREATE (a)-[:CONNECTED_TO" + relPropsString + "]->(b), " +
                    "(b)-[:CONNECTED_TO" + relPropsString + "]->(a)";
            tx.run(query, row);
        }
    }

    /**
     * Populates the database with IS_IN relations between Location and Area nodes.
     * This method assumes that Locations have an areaId, whose entries contain integer type values referring to the
     * Areas that should have the relation.
     */
    private static void createIsIn(TransactionContext tx, CSV locations) {
        if (!locations.containsColumn("areaId")) {
            throw new RuntimeException("Locations do not contain buildingId.");
        }

        if (!locations.getColumnType("areaId").equals("int")) {
            throw new RuntimeException("Locations.csv data malformed; ensure areaIds are integers.");
        }

        for (int i = 0; i < locations.size(); i++) {
            Map<String, Object> row = locations.getRow(i);

            String query = """
                        MATCH (l:Location {id: $id}), (a:Area {id: $areaId})
                        CREATE (l)-[:IS_IN]->(a)
                    """;

            tx.run(query, row);
        }
    }

    /**
     * Runs all tests specified.
     */
    private static void runTests(CSV locations, CSV connections, CSV areas) {
        // Ensures the headers for each CSV are in the correct format (e.g., Location.csv has booleans for entries in
        // the isValidDestination column)
        locationsHeaderTypeTest(locations);
        connectionsHeaderTypeTest(connections);
        areasHeaderTypeTest(areas);

        // Will write more later if time permits
    }

    /**
     * Test cases for ensuring Location.csv headers are in the correct format.
     */
    private static void locationsHeaderTypeTest(CSV locations) {
        assert locations.containsColumn("id") && locations.getColumnType("id").equals("int");
        assert locations.containsColumn("latitude") && locations.getColumnType("latitude").equals("double");
        assert locations.containsColumn("longitude") && locations.getColumnType("longitude").equals("double");
        assert locations.containsColumn("floor") && locations.getColumnType("floor").equals("double");
        assert locations.containsColumn("areaId") && locations.getColumnType("areaId").equals("int");
        assert locations.containsColumn("name") && locations.getColumnType("name").equals("string");
        assert locations.containsColumn("isValidDestination") && locations.getColumnType("isValidDestination").equals("boolean");
    }

    /**
     * Test cases for ensuring CONNECTED_TO.csv headers are in the correct format.
     */
    private static void connectionsHeaderTypeTest(CSV connections) {
        assert connections.containsColumn("startId") && connections.getColumnType("startId").equals("int");
        assert connections.containsColumn("endId") && connections.getColumnType("endId").equals("int");
        assert connections.containsColumn("distance") && connections.getColumnType("distance").equals("double");
    }

    /**
     * Test cases for ensuring Area.csv headers are in the correct format.
     */
    private static void areasHeaderTypeTest(CSV areas) {
        assert areas.containsColumn("id") && areas.getColumnType("id").equals("int");
        assert areas.containsColumn("name") && areas.getColumnType("id").equals("string");
        assert areas.containsColumn("abbreviation") && areas.getColumnType("abbreviation").equals("string");
    }
}