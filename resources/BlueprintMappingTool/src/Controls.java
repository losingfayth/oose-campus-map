import fixed.ScrollableImageView;
import javafx.geometry.Point2D;
import javafx.scene.Scene;
import javafx.scene.input.KeyCode;
import mapping.OpenLocationCode;
import mapping.Point;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.InputMismatchException;
import java.util.Scanner;

public class Controls
{
    public static void InitializeControls(Scene scene, ScrollableImageView imageView,
                                          SelectorPane imagePane) {
        scene.setOnKeyPressed(event -> {
            if ((event.getCode() == KeyCode.R) && !imagePane.isRootMode()) {

                System.out.println("Start: Root select Mode");
                imagePane.setRootMode(true);
            }
            if (event.getCode() == KeyCode.D && !imagePane.isDeleteEdgeMode()) {
                System.out.println("Start: delete edge mode");
                imagePane.setDeleteEdgeMode(true);
            }
            if (event.getCode() == KeyCode.CONTROL)
            {
                imagePane.setScroll(true);
            }
        });

        scene.setOnKeyReleased(event -> {

            if ((event.getCode() == KeyCode.R) && imagePane.isRootMode()) {
                System.out.println("Stop: Root select Mode");
                imagePane.setRootMode(false);
            }
            if (event.getCode() == KeyCode.D && imagePane.isDeleteEdgeMode()) {
                System.out.println("Stop: delete edge mode");
                imagePane.setDeleteEdgeMode(false);
            }
            if (event.getCode() == KeyCode.CONTROL)
            {
                imagePane.setScroll(false);
            }
        });

        imageView.setOnMouseDragged(e ->
        {
            if (imagePane.isPanEnabled())
            {
                imageView.pan(new Point2D(e.getX(), e.getY()),
                        imagePane.getEnteredLocations().getNodes(), imagePane.getEdges());

            }

        });

        imageView.setOnScroll(e ->
        {
            imageView.zoom(e.getX(), e.getY(), e.getDeltaY(),
                    imagePane.getEnteredLocations().getNodes(), imagePane.getEdges());
        });
    }

    public static int getStartingIndexFromConsole(Scanner input)
    {
        int index;
        do {
            System.out.println("Begin marking at what index?");
            try {
                index = input.nextInt();
                break;
            } catch (InputMismatchException e) {
                System.out.println(e.toString());
            }
        } while (true);

        return index;
    }

    public static Point[] getPointsFromConsole(Scanner input)
    {
        Point[] points = new Point[3];

        boolean plusCode = false;
        String s = "";

        do {
            System.out.println("If you would like to enter the real world coordinates as " +
                    "latitude/longitude pairs, enter L. If you would like to enter the real" +
                    " world coordinates as Plus Codes, enter P");
            s = input.nextLine();
        } while (!s.equals("L") && !s.equals("P"));

        plusCode = s.equals("P");

        if (plusCode) {
            System.out.println("Enter the plus codes corresponding to where the " +
                    "blueprint exists in the real world. Begin with the coordinate that" +
                    " matches the top left corner of the blueprint, followed by top " +
                    "right, bottom left, and bottom right. Enter the 7 digit plus code " +
                    "that specifies an area in Bloomsburg campus - of the form: " +
                    "\"2H42+MWC\"");
        } else {
            System.out.println("Enter the latitude, longitude coordinates of where the " +
                    "blueprint exists in the real world. Enter the coordinates one at a " +
                    "time - that is, one latitude / longitude pair at a time. ie, \"41" +
                    ".10128412, -73.12089412\" before pressing enter. Begin with the " +
                    "coordinate that matches the top left corner of the blueprint, followed" +
                    " by top right, bottom left, and bottom right.");
        }



        if (plusCode) {
            String code;

            for (int i = 0; i < points.length; i++) {
                System.out.println("Enter plus code " + (i+1));
                code = input.nextLine();
                code = OpenLocationCode.CAMPUS_LOC_GRID + code;
                try {
                    OpenLocationCode.CodeArea area = OpenLocationCode.decode(code);
                    points[i] = new Point(area.getCenterLatitude(),
                            area.getCenterLongitude());
                } catch (IllegalArgumentException e) {
                    System.out.println("Bad code - try again");
                    i--;
                }


            }
        } else {
            double x, y;

            for (int i = 0; i < points.length; i++) {
                System.out.printf("%nEnter coordinate %d.%n", (i+1));
                char[] inputArray = input.nextLine().toCharArray();
                points[i] = getGcsFromConsole(inputArray);


            }
        }

        return points;
    }

    public static String getInputFileNameFromConsole(Scanner input) {
        String inputFileName;

        while (true) {
            System.out.println("Enter the image file (.png)");

            inputFileName = input.nextLine();
            if (inputFileName.charAt(0) == '\'') {
                inputFileName = inputFileName.substring(1);
            }
            if (inputFileName.charAt(inputFileName.length() - 1) == '\'') {
                inputFileName = inputFileName.substring(0, inputFileName.length() - 1);
            }
            try
            {
                InputStream inputStream = new FileInputStream(inputFileName);
                break;
            } catch (FileNotFoundException f) {
                System.out.println("\n"+inputFileName + " is invalid file path.");
            }
        }

        return inputFileName;
    }

    private static Point getGcsFromConsole(char[] inputArray)
    {

        StringBuilder lat = new StringBuilder();
        StringBuilder lng = new StringBuilder();
        int j;
        for (j = 0; j < inputArray.length && isValidFloatCharacter(inputArray[j]); j++ ) {
            lat.append(inputArray[j]);
        }
        while (!isValidFloatCharacter(inputArray[j])) {
            j++;
        }
        for (; j < inputArray.length; j++) {
            lng.append(inputArray[j]);
        }

        return new Point(Double.parseDouble(lat.toString()),
                Double.parseDouble(lng.toString()));
    }

    private static boolean isValidFloatCharacter(char c)
    {
        return (Character.isDigit(c) || c == '-' || c == '.');
    }
}
