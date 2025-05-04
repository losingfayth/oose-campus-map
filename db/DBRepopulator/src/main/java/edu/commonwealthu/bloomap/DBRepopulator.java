package edu.commonwealthu.bloomap;

import org.neo4j.driver.*;
import java.io.File;
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
    public static void main(String[] args) {
        final String dbUri = "neo4j+ssc://apibloomap.xyz:7687";
        final String dbUser = System.getenv("DB_USER");
        final String dbPass = System.getenv("DB_PASSWORD");
        if (dbUser == null || dbPass == null) {
            throw new RuntimeException("Environment variables DB_USER and/or DB_PASSWORD are not set.");
        }

        final File locationFile = new File("../csvs/Location.csv");
        final File connectedToFile = new File("../csvs/CONNECTED_TO.csv");
        final File areaFile = new File("../csvs/Area.csv");
        final File locationCategoryFile = new File("../csvs/LocationCategory.csv");
        final File stairTypeFile = new File("../csvs/StairType.csv");
        final File bathroomTypeFile = new File("../csvs/BathroomType.csv");
        final File bathroomIsTypeFile = new File("../csvs/BATHROOM_IS_TYPE.csv");
        final File stairIsTypeFile = new File("../csvs/STAIR_IS_TYPE.csv");

        final CSV location = new CSV(locationFile);
        final CSV connectedTo = new CSV(connectedToFile);
        final CSV area = new CSV(areaFile);
        final CSV locationCategory = new CSV(locationCategoryFile);
        final CSV stairType = new CSV(stairTypeFile);
        final CSV bathroomType = new CSV(bathroomTypeFile);
        final CSV stairIsType = new CSV(stairIsTypeFile);
        final CSV bathroomIsType = new CSV(bathroomIsTypeFile);

        runTests(location, connectedTo, area, locationCategory, stairType, bathroomType, stairIsType, bathroomIsType);

        long startTime;
        try (Driver driver = GraphDatabase.driver(dbUri, AuthTokens.basic(dbUser, dbPass))) {
            driver.verifyConnectivity();
            System.out.println("Connected to database as user " + dbUser + ".\n" +
                    "Beginning repopulation...\n");
            try (Session session = driver.session()) {
                startTime = System.nanoTime();

                session.executeWrite(tx -> {
                    executeLabeledAndTimed(() -> nuke(tx), "Removing all Nodes...");

                    executeLabeledAndTimed(() -> insertLocations(tx, location), "Inserting Location nodes...");
                    executeLabeledAndTimed(() -> insertAreas(tx, area), "Inserting Area nodes...");
                    executeLabeledAndTimed(() -> insertLocationCategories(tx, locationCategory),
                            "Inserting LocationCategory nodes...");
                    executeLabeledAndTimed(() -> insertStairTypes(tx, stairType), "Inserting StairType nodes...");
                    executeLabeledAndTimed(() -> insertBathroomTypes(tx, bathroomType),
                            "Inserting BathroomType nodes...");

                    executeLabeledAndTimed(() -> createConnectedTo(tx, connectedTo),
                            "Creating CONNECTED_TO relationships...");
                    executeLabeledAndTimed(() -> createIsIn(tx, location), "Creating IS_IN relationships...");
                    executeLabeledAndTimed(() -> createInCategory(tx, location),
                            "Creating IN_CATEGORY relationships...");
                    executeLabeledAndTimed(() -> createStairIsType(tx, stairIsType),
                            "Creating stair IS_TYPE relationships...");
                    executeLabeledAndTimed(() -> createBathroomIsType(tx, bathroomIsType),
                            "Creating bathroom IS_TYPE relationships...");

                    executeLabeledAndTimed(() -> removeForeignKeys(tx),
                            "Removing areaId and locationCategoryId from Location nodes...");

                    return null;
                });
            }
        } catch (Exception e) {
            System.err.println("An error prevented database repopulation. The database remains unmodified.\n" +
                    "See the error below:");
            e.printStackTrace();
            return;
        }

        long endTime = System.nanoTime();
        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
        System.out.printf("Database successfully repopulated in %.2f seconds.%n", durationSeconds);
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
     * Removes all Location, Area, LocationCategory, StairType, and BathroomType nodes in the database.
     */
    private static void nuke(TransactionContext tx) {
        tx.run("MATCH (n) WHERE n:Location OR n:Area OR n:LocationCategory OR n:StairType OR n:BathroomType DETACH DELETE n");
    }

    // I am aware that the next 6 methods can be collapsed into one and that it would take like 3 minutes to do so.
    // I just want to get this working before all else.
    // -Brandon 5/4/25 12:39AM

    /**
     * Uses the Location CSV to populate the database with Location nodes.
     */
    private static void insertLocations(TransactionContext tx, CSV location) {
        for (int i = 0; i < location.size(); i++) {
            Map<String, Object> row = location.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:Location {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * Uses the Area CSV to populate the database with Area nodes.
     */
    private static void insertAreas(TransactionContext tx, CSV area) {
        for (int i = 0; i < area.size(); i++) {
            Map<String, Object> row = area.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:Area {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * Uses the StairType CSV to populate the database with StairType nodes.
     */
    private static void insertStairTypes(TransactionContext tx, CSV stairType) {
        for (int i = 0; i < stairType.size(); i++) {
            Map<String, Object> row = stairType.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:StairType {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * Uses the BathroomType CSV to populate the database with BathroomType nodes.
     */
    private static void insertBathroomTypes(TransactionContext tx, CSV bathroomType) {
        for (int i = 0; i < bathroomType.size(); i++) {
            Map<String, Object> row = bathroomType.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:BathroomType {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * uses the LocationCategory CSV to populate the database with LocationCategory nodes.
     */
    private static void insertLocationCategories(TransactionContext tx, CSV locationCategory) {
        for (int i = 0; i < locationCategory.size(); i++) {
            Map<String, Object> row = locationCategory.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:LocationCategory {" + props + "})";
            tx.run(query, row);
        }
    }

    /**
     * Uses the CONNECTED_TO CSV to populate the database with CONNECTED_TO relations between Location nodes.
     * The relation is symmetric; if Location node a is CONNECTED_TO Location node b, then b is also CONNECTED_TO a.
     */
    private static void createConnectedTo(TransactionContext tx, CSV connectedTo) {
        for (int i = 0; i < connectedTo.size(); i++) {
            Map<String, Object> row = connectedTo.getRow(i);

            List<String> relProps = row.keySet().stream()
                    .filter(k -> !k.equals("locationId1") && !k.equals("locationId2"))
                    .map(k -> k + ": $" + k)
                    .collect(Collectors.toList());
            String relPropsString = relProps.isEmpty() ? "" : " {" + String.join(", ", relProps) + "}";

            String query = "MATCH (a:Location {id: $locationId1}), (b:Location {id: $locationId2}) " +
                    "CREATE (a)-[:CONNECTED_TO" + relPropsString + "]->(b), " +
                    "(b)-[:CONNECTED_TO" + relPropsString + "]->(a)";
            tx.run(query, row);
        }
    }

    /**
     * Populates the database with IS_IN relations between Location and Area nodes.
     */
    private static void createIsIn(TransactionContext tx, CSV location) {
        for (int i = 0; i < location.size(); i++) {
            Map<String, Object> row = location.getRow(i);

            String query = """
                        MATCH (l:Location {id: $id}), (a:Area {id: $areaId})
                        CREATE (l)-[:IS_IN]->(a)
                    """;

            tx.run(query, row);
        }
    }

    /**
     * Populates the database with IN_CATEGORY relations between Location and LocationCategory nodes.
     */
    private static void createInCategory(TransactionContext tx, CSV location) {
        for (int i = 0; i < location.size(); i++) {
            Map<String, Object> row = location.getRow(i);

            String query = """
                        MATCH (l:Location {id: $id}), (c:LocationCategory {id: $locationCategoryId})
                        CREATE (l)-[:IN_CATEGORY]->(c)
                    """;

            tx.run(query, row);
        }
    }

    /**
     * Populates the database with IS_TYPE relations between Location nodes that are IN_CATEGORY Stair and the
     * StairType nodes.
     */
    private static void createStairIsType(TransactionContext tx, CSV stairIsType) {
        for (int i = 0; i < stairIsType.size(); i++) {
            Map<String, Object> row = stairIsType.getRow(i);
            String query = "MATCH (l:Location {id: $locationId}), (t:StairType {id: $stairTypeId}) " +
                    "CREATE (l)-[:IS_TYPE]->(t)";
            tx.run(query, row);
        }
    }

    /**
     * Populates the database with IS_TYPE relations between Location nodes that are IN_CATEGORY Bathroom and the
     * BathroomType nodes.
     */
    private static void createBathroomIsType(TransactionContext tx, CSV bathroomIsType) {
        for (int i = 0; i < bathroomIsType.size(); i++) {
            Map<String, Object> row = bathroomIsType.getRow(i);
            String query = "MATCH (l:Location {id: $locationId}), (t:BathroomType {id: $bathroomTypeId}) " +
                    "CREATE (l)-[:IS_TYPE]->(t)";
            tx.run(query, row);
        }
    }

    /**
     * Removes the areaId and locationCategoryId attributes from each Location node, as they are only needed to assign
     * the IS_IN and IN_CATEGORY relationships. (There is no need to ever query these fields because the same thing is
     * reflected in the relationships.)
     */
    private static void removeForeignKeys(TransactionContext tx) {
        tx.run("MATCH (l:Location) REMOVE l.areaId, l.locationCategoryId");
    }

    /**
     * Runs all tests specified.
     */
    private static void runTests(CSV location, CSV connectedTo, CSV area, CSV locationCategory, CSV stairType, CSV bathroomType, CSV stairIsType, CSV bathroomIsType) {
        // Ensures the headers for each CSV are in the correct format (e.g., Location.csv has doubles for entries in
        // the latitude column)
        locationsHeaderTypeTest(location);
        connectedToHeaderTypeTest(connectedTo);
        areaHeaderTypeTest(area);
        locationCategoryHeaderTypeTest(locationCategory);
        stairTypeHeaderTypeTest(stairType);
        bathroomTypeHeaderTypeTest(bathroomType);
        stairIsTypeHeaderTypeTest(stairIsType);
        bathroomIsTypeHeaderTypeTest(bathroomIsType);

        // Will write more later if time permits
    }

    /**
     * Test cases for ensuring Location.csv headers are in the correct format.
     */
    private static void locationsHeaderTypeTest(CSV location) {
        assert location.containsColumn("id") && location.getColumnType("id").equals("int");
        assert location.containsColumn("latitude") && location.getColumnType("latitude").equals("double");
        assert location.containsColumn("longitude") && location.getColumnType("longitude").equals("double");
        assert location.containsColumn("floor") && location.getColumnType("floor").equals("double");
        assert location.containsColumn("areaId") && location.getColumnType("areaId").equals("int");
        assert location.containsColumn("name") && location.getColumnType("name").equals("string");
        assert location.containsColumn("isValidDestination") && location.getColumnType("isValidDestination").equals("int");
        assert location.containsColumn("isAccessible") && location.getColumnType("isAccessible").equals("int");
        assert location.containsColumn("categoryId") && location.getColumnType("categoryId").equals("int");
    }

    /**
     * Test cases for ensuring CONNECTED_TO.csv headers are in the correct format.
     */
    private static void connectedToHeaderTypeTest(CSV connectedTo) {
        assert connectedTo.containsColumn("locationId1") && connectedTo.getColumnType("locationId1").equals("int");
        assert connectedTo.containsColumn("locationId2") && connectedTo.getColumnType("locationId2").equals("int");
        assert connectedTo.containsColumn("distance") && connectedTo.getColumnType("distance").equals("double");
    }

    /**
     * Test cases for ensuring Area.csv headers are in the correct format.
     */
    private static void areaHeaderTypeTest(CSV stairType) {
        assert stairType.containsColumn("id") && stairType.getColumnType("id").equals("int");
        assert stairType.containsColumn("name") && stairType.getColumnType("name").equals("string");
        assert stairType.containsColumn("abbreviation") && stairType.getColumnType("abbreviation").equals("string");
        assert stairType.containsColumn("numFloors") && stairType.getColumnType("numFloors").equals("int");
        assert stairType.containsColumn("lowestFloor") && stairType.getColumnType("lowestFloor").equals("int");
    }

    /**
     * Test cases for ensuring LocationCategory.csv headers are in the correct format.
     */
    private static void locationCategoryHeaderTypeTest(CSV locationCategory) {
        assert locationCategory.containsColumn("id") && locationCategory.getColumnType("id").equals("int");
        assert locationCategory.containsColumn("name") && locationCategory.getColumnType("name").equals("string");
    }

    /**
     * Test cases for ensuring StairType.csv headers are in the correct format.
     */
    private static void stairTypeHeaderTypeTest(CSV stairType) {
        assert stairType.containsColumn("id") && stairType.getColumnType("id").equals("int");
        assert stairType.containsColumn("name") && stairType.getColumnType("name").equals("string");
    }

    /**
     * Test cases for ensuring BathroomType.csv headers are in the correct format.
     */
    private static void bathroomTypeHeaderTypeTest(CSV bathroomType) {
        assert bathroomType.containsColumn("id") && bathroomType.getColumnType("id").equals("int");
        assert bathroomType.containsColumn("name") && bathroomType.getColumnType("name").equals("string");
    }

    /**
     * Test cases for ensuring STAIR_IS_TYPE.csv headers are in the correct format.
     */
    private static void stairIsTypeHeaderTypeTest(CSV stairIsType) {
        assert stairIsType.containsColumn("locationId") && stairIsType.getColumnType("locationId").equals("int");
        assert stairIsType.containsColumn("stairTypeId") && stairIsType.getColumnType("stairTypeId").equals("int");
    }

    /**
     * Test cases for ensuring BATHROOM_IS_TYPE.csv headers are in the correct format.
     */
    private static void bathroomIsTypeHeaderTypeTest(CSV bathroomIsType) {
        assert bathroomIsType.containsColumn("locationId") && bathroomIsType.getColumnType("locationId").equals("int");
        assert bathroomIsType.containsColumn("bathroomTypeId") && bathroomIsType.getColumnType("bathroomTypeId").equals("int");
    }
}