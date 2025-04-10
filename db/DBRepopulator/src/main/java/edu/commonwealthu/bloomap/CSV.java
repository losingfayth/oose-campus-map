package edu.commonwealthu.bloomap;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Helper class that represents a CSV file in memory.
 *
 * @author Brandon Ikeler
 */
public class CSV {

    // Keys are the names of the headers of the CSV, values are their datatypes represented as Strings.
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
    public Map<String, String> getHeaders() {
        return new LinkedHashMap<>(headers);
    }

    /**
     * Returns a deep copy of the rows of this CSV.
     */
    public List<Map<String, Object>> getRows() {
        return rows.stream()
                .map(HashMap::new)
                .collect(Collectors.toList());
    }

    public boolean containsColumn(String columnName) {
        return headers.containsKey(columnName);
    }

    public int size() {
        return rows.size();
    }

    public Map<String, Object> getRow(int i) {
        return rows.get(i);
    }

    public boolean isEmpty() {
        return rows.isEmpty();
    }

    public String getColumnType(String columnName) {
        // Possibly null
        return headers.get(columnName);
    }

    private void parse(File file) {
        try (Scanner scanner = new Scanner(file)) {
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
            throw new RuntimeException("CSV file not found: " + file.getAbsolutePath(), e);
        }
    }

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

    private Object convertValue(String value, String type) {
        return switch (type.toLowerCase()) {
            case "int" -> Integer.parseInt(value);
            case "double" -> Double.parseDouble(value);
            case "boolean" -> Boolean.parseBoolean(value);
            default -> value;
        };
    }
}


