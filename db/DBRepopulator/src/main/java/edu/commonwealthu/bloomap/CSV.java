package edu.commonwealthu.bloomap;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Helper class that represents a CSV file in memory. Contains methods for retrieving information about said CSV.
 *
 * @author Brandon Ikeler
 */
public class CSV {

    // Keys are the names of the headers of the CSV, values are their datatypes represented as Strings.
    // This is implemented as a LinkedHashMap, which maintains insertion order. This fact is used in the write() method.
    private final Map<String, String> headers;

    // A row is a Map from the header names to the value of the entry for that column in the row.
    // It is guaranteed that all entries in the same column are stored as the most appropriate and identical datatype.
    // For example, if one of the headers in a CSV is price, and two rows have entries of 4.55 and 2 in this position,
    // then the data type of the values found by the price key for both rows is double, rather than double for the first
    // row and int for the second.
    private final List<Map<String, Object>> rows;

    /**
     * Constructs a new CSV. Data is brought into memory in the parse method.
     * @param file the path to the CSV file on disk.
     */
    public CSV(File file) {
        this.headers = new LinkedHashMap<>();
        this.rows = new ArrayList<>();
        parse(file);
    }

    /**
     * Returns a deep copy of the headers of this CSV.
     */
    @SuppressWarnings("unused")
    public Map<String, String> getHeaders() {
        return new LinkedHashMap<>(headers);
    }

    /**
     * Returns a deep copy of the rows of this CSV.
     */
    @SuppressWarnings("unused")
    public List<Map<String, Object>> getRows() {
        return rows.stream()
                .map(HashMap::new)
                .collect(Collectors.toList());
    }

    /**
     * Returns whether this CSV has a column with the specified name.
     */
    public boolean containsColumn(String columnName) {
        return headers.containsKey(columnName);
    }

    /**
     * Returns the number of rows in this CSV.
     * Does not include the header row.
     */
    public int size() {
        return rows.size();
    }

    /**
     * Returns the ith row of this CSV.
     */
    public Map<String, Object> getRow(int i) {
        return rows.get(i);
    }

    /**
     * Returns true if this CSV has no rows.
     */
    @SuppressWarnings("unused")
    public boolean isEmpty() {
        return rows.isEmpty();
    }

    /**
     * Removes the row at the specified index from this CSV.
     */
    @SuppressWarnings("unused")
    public void remove(int i) {
        rows.remove(i);
    }

    /**
     * Returns a string that specifies the type of data that entries in the specified column are.
     *
     * @return "string", "boolean", "double", or "int"
     */
    public String getColumnType(String columnName) {
        // Possibly null
        return headers.get(columnName);
    }

    /**
     * Sorts a CSV by applying the natural ordering on a specific column.
     * For example, if a CSV has an "id" header with integer-valued entries, specifying "id" as the argument to this
     * method will sort the CSV by id in ascending order.
     */
    @SuppressWarnings({"unchecked", "unused"})
    public void sort(String columnName) {
        // If the specified column isn't in this CSV, throw an exception
        if (!containsColumn(columnName)) {
            throw new RuntimeException("Specified header does not exist in this CSV: " + columnName);
        }

        rows.sort(Comparator.comparing(row -> (Comparable<Object>) row.get(columnName), Comparator.naturalOrder()));
    }

    /**
     * Writes this CSV to the specified file.
     */
    @SuppressWarnings("unused")
    public void write(File outFile) {
        try (PrintWriter writer = new PrintWriter(outFile)) {
            // Writes the header line
            writer.print(String.join(",", headers.keySet()));

            // Writes each row using the order of the headers. It's necessary to use the order of the headers rather
            // than just iterating over the keys for the entries in each row because the headers (a LinkedHashMap)
            // maintain insertion order--not the keys in each row.
            for (Map<String, Object> row : rows) {
                List<String> entries = new ArrayList<>();
                for (String header : headers.keySet()) {
                    Object entry = row.get(header);
                    entries.add(entry.toString());
                }
                writer.print("\n" + String.join(",", entries));
            }
        } catch (FileNotFoundException e) {
            throw new RuntimeException("Unable to write CSV to file: " + outFile.getAbsolutePath(), e);
        }
    }

    /**
     * Reads a CSV at the specified file into memory.
     * The first row of the CSV must be its headers.
     */
    private void parse(File inFile) {
        try (Scanner scanner = new Scanner(inFile)) {
            String[] headerArray = scanner.nextLine().split(",");

            List<List<String>> rawData = new ArrayList<>();
            while (scanner.hasNextLine()) {
                String[] row = scanner.nextLine().split(",");

                if (row.length != headerArray.length) {
                    throw new RuntimeException("CSV row length does not match header length: " + Arrays.toString(row));
                }

                rawData.add(Arrays.asList(row));
            }

            for (int i = 0; i < headerArray.length; i++) {
                String header = headerArray[i];
                String inferredType = inferColumnType(rawData, i);
                headers.put(header, inferredType);
                for (int j = 0; j < rawData.size(); j++) {
                    List<String> rawRow = rawData.get(j);
                    if (i == 0) {
                        rows.add(new HashMap<>());
                    }
                    rows.get(j).put(header, convertValue(rawRow.get(i).trim(), inferredType));
                }
            }
        } catch (FileNotFoundException e) {
            throw new RuntimeException("CSV file not found: " + inFile.getAbsolutePath(), e);
        }
    }

    /**
     * Determines what type of data that entries in the specified column are.
     *
     * @param data the raw data from the CSV file. Outer list is rows, and inner list is the data at each position in
     *             the row.
     * @param columnIndex the index of the column (i.e., which header) to infer the type of.
     *
     * @return a string that specifies the type of data that entries in the specified column are. (either "string",
     *         "boolean", "double", or "int")
     */
    private String inferColumnType(List<List<String>> data, int columnIndex) {
        boolean allInt = true, allDouble = true, allBoolean = true;

        for (List<String> row : data) {
            if (columnIndex >= row.size()) continue;
            String val = row.get(columnIndex).trim();
            if (val.isEmpty()) continue;
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

        if (allInt) return "int";
        if (allDouble) return "double";
        if (allBoolean) return "boolean";
        return "string";
    }

    /**
     * Converts the specified value to the type specified by the string.
     */
    private Object convertValue(String value, String type) {
        return switch (type.toLowerCase()) {
            case "int" -> Integer.parseInt(value);
            case "double" -> Double.parseDouble(value);
            case "boolean" -> Boolean.parseBoolean(value);
            default -> value;
        };
    }
}


