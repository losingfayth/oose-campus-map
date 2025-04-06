package edu.commonwealthu.bloomap;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.Scanner;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

/**
 * Helper program that nukes every Location node in the database and repopulates it from the nodes and edges CSVs.
 *
 * @author Brandon Ikeler
 */
public class Main {
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

        ArrayList<Dictionary<String, String>> nodes = readCsv(nodesFile);
        ArrayList<Dictionary<String, String>> edges = readCsv(edgesFile);

        for (Dictionary<String, String> rowEntry : nodes) {
            System.out.println(rowEntry.elements());
        }

        for (Dictionary<String, String> rowEntry : edges) {
            System.out.println(rowEntry.elements());
        }
    }

    private static ArrayList<Dictionary<String, String>> readCsv(File csv) {
        Scanner csvScanner;
        try {
            csvScanner = new Scanner(csv);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }

        String[] csvHeaders = csvScanner.nextLine().split(",");

        ArrayList<Dictionary<String, String>> csvData = new ArrayList<>();
        while (csvScanner.hasNextLine()) {
            Dictionary<String, String> rowEntry = new Hashtable<>();
            String[] csvRow = csvScanner.nextLine().split(",");
            assert (csvHeaders.length == csvRow.length);
            for (int i = 0; i < csvHeaders.length; i++) {
                try {
                    rowEntry.put(csvHeaders[i], csvRow[i]);
                } catch (IndexOutOfBoundsException e) {
                    for (String s : csvRow) {
                        System.out.println(s);
                    }
                    System.exit(1);
                }
            }
            csvData.add(rowEntry);

        }
        csvScanner.close();
        return csvData;
    }
}