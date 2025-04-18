import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Scanner;

public class CSVRecord
{
        private final ArrayList<String> columnHeaders;
        private HashMap<String, Integer> columnType;
        private static String SPACING = "    ";
        ArrayList<CSVRow> rows;

        public CSVRecord(ArrayList<String> columnHeaders) {
            this.columnHeaders = columnHeaders;
            this.columnType = new HashMap<>(columnHeaders.size());
            this.rows = new ArrayList<>(1000);
            for (int i = 0; i < columnHeaders.size(); i++) {
                columnType.put(columnHeaders.get(i), i);
            }

        }

    public ArrayList<String> getColumnHeaders()
    {
        return columnHeaders;
    }

    public static CSVRecord ReadCSV(String nodesCSVinPath) throws FileNotFoundException
    {
        CSVRecord record;

        try (Scanner scanner = new Scanner(new File(nodesCSVinPath)))
        {
            ArrayList<String> columnHeaders =
                    CSVRecord.getRecordFromLine(scanner.nextLine());
            record = new CSVRecord(columnHeaders);
            while (scanner.hasNextLine())
            {
//                ArrayList<String> row = CSVRecord.getRecordFromLine(scanner.nextLine());
//                nodeRecords.add(row);

                record.addRow(scanner.nextLine());
            }
        }
        record.print(",");
        return record;
    }

    public void addRow(String csValues) {
            rows.add(new CSVRow(csValues));
        }

    public void addRow(CSVRow row) {
            rows.add(new CSVRow(row));
    }


    public static ArrayList<String> getRecordFromLine(String line)
    {
        ArrayList<String> values = new ArrayList<String>();
        try (Scanner rowScanner = new Scanner(line))
        {
            rowScanner.useDelimiter(",");
            while (rowScanner.hasNext())
            {
                values.add(rowScanner.next());
            }
        }
        return values;
    }

    @Override
    public String toString()
    {
        return print(SPACING);

    }

    private String print(String delimiter) {
        StringBuilder s = new StringBuilder();

        for (String headers : columnHeaders) {
            s.append(headers).append(delimiter);
        }
        s.append("\n");

        for (CSVRow l : rows) {
            s.append(l.print(delimiter)).append("\n");
        }

        return s.toString();
    }

    public String getCSVFormat()
    {
        return print(",");
    }



    public class CSVRow {
        //id	locationCode	latitude	longitude	floor	areaId	name	isValidDestination

        private ArrayList<String> values;
        public CSVRow(String line) {
            this.values = getRecordFromLine(line);
        }

        public CSVRow(CSVRow row)
        {
            this.values = new ArrayList<>();
            this.values.addAll(row.values);
        }

        public String get(String columnName) {
            return values.get(columnType.get(columnName));
        }

        public String get(int columnNum) {
            return values.get(columnNum);
        }

        public void setValue(String columnName, String value) {
            values.set(columnType.get(columnName), value);
        }

        public String print(String delimiter) {
            StringBuilder s = new StringBuilder();
            for (String string : values) {
                s.append(string).append(delimiter);
            }

            return s.toString();
        }

        @Override
        public String toString()
        {
            return print(SPACING);
        }


    }
}
