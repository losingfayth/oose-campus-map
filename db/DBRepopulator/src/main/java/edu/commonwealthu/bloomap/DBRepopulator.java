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
        final CSV locations = new CSV(locationFile);
        final CSV connections = new CSV(connectedToFile);
        final CSV areas = new CSV(areaFile);

        long startTime = 0;
        try (Driver driver = GraphDatabase.driver(dbUri, AuthTokens.basic(dbUser, dbPass))) {
            driver.verifyConnectivity();
            System.out.println("Connected to database as user " + dbUser + ".\n" +
                    "Beginning repopulation...");
            try (Session session = driver.session()) {
                startTime = System.nanoTime();

                session.executeWrite(tx -> {
                    executeLabeledAndTimed(() -> nuke(tx), "Removing all Location and Area nodes...");
                    executeLabeledAndTimed(() -> insertLocations(tx, locations), "Inserting Location nodes...");
                    executeLabeledAndTimed(() -> createConnectedTo(tx, connections),
                            "Creating CONNECTED_TO relationships...");
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

    private static void executeLabeledAndTimed(Runnable task, String startMessage) {
        if (startMessage != null) {
            System.out.println(startMessage);
        }

        long startTime = System.nanoTime();

        task.run();

        long endTime = System.nanoTime();
        double durationSeconds = (endTime - startTime) / 1_000_000_000.;
        System.out.printf("Operation completed in %.2f seconds.%n", durationSeconds);
    }

    /**
     * Removes all Location and Area nodes in the database.
     */
    private static void nuke(TransactionContext tx) {
        tx.run("MATCH (n) WHERE n:Location OR n:Area DETACH DELETE n");
    }

    private static void insertLocations(TransactionContext tx, CSV nodes) {
        if (nodes.isEmpty()) {
            System.err.println("No Locations found.");
            return;
        }

        for (int i = 0; i < nodes.size(); i++) {
            Map<String, Object> row = nodes.getRow(i);
            String props = row.keySet().stream()
                    .map(key -> key + ": $" + key)
                    .collect(Collectors.joining(", "));
            String query = "CREATE (:Location {" + props + "})";
            tx.run(query, row);
        }
    }

    public static void createConnectedTo(TransactionContext tx, CSV edges) {
        if (edges.isEmpty()) {
            System.out.println("No edge data found.");
            return;
        }

        if (!edges.containsColumn("startId") || !edges.containsColumn("endId")) {
            throw new RuntimeException("CONNECTED_TO.csv missing startId or endId columns.");
        }
        if (!edges.getColumnType("startId").equals("int")
                || !edges.getColumnType("endId").equals("int")) {
            throw new RuntimeException("CONNECTED_TO.csv data malformed; ensure startId and endId are all integers.");
        }

        for (int i = 0; i < edges.size(); i++) {
            Map<String, Object> row = edges.getRow(i);

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
}