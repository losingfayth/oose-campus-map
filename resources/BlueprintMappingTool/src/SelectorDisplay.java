import javafx.application.Application;
import javafx.embed.swing.SwingFXUtils;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.image.WritableImage;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Text;
import javafx.stage.Stage;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.InputMismatchException;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicInteger;
import mapping.*;
import mapping.Point;
/*
Comment
 */

public class SelectorDisplay extends Application
{
    int maxDisplayDim = 1200;
    int controlHeight = 50;

    @Override
    public void start(Stage stage) throws Exception
    {
        int displayImageHeight;
        int displayImageWidth;
        BorderPane root = new BorderPane();

        Pane imagePane = new Pane();
        root.setCenter(imagePane);

        Pane controlPane = new Pane();
        root.setBottom(controlPane);

        Button saveButton = new Button("saveImage");
        String saveLocation = "";

        controlPane.getChildren().add(saveButton);

        FileInputStream inputStream;
        String inputFileName = "";

        Scanner input = new Scanner(System.in);

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
                inputStream = new FileInputStream(inputFileName);
                break;
            } catch (FileNotFoundException f) {
                System.out.println("\n"+inputFileName + " is invalid file path.");
            }
        }

        saveLocation = inputFileName.substring(0, inputFileName.length() - 4) +
                "_POINTSLABELED.png";


        System.out.println(inputFileName + " accessed.");
        Image image = new Image(inputStream);
        ImageView imageView = new ImageView(image);

        double ix =  image.getWidth();
        double iy = image.getHeight();


        if (ix >= (iy)) {
            displayImageWidth = maxDisplayDim;
            displayImageHeight = (int) Math.floor((iy/ix) * maxDisplayDim);
        } else {
            displayImageHeight = maxDisplayDim;
            displayImageWidth = (int) Math.floor((ix/iy) * maxDisplayDim);
        }

        imageView.setFitWidth(displayImageWidth);
        imageView.setFitHeight(displayImageHeight);


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


        Point[] points = new Point[4];

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
                x = input.nextDouble();
                y = input.nextDouble();
                points[i] = new Point(x, y);
            }
        }

        int sIndex;
        do {
            System.out.println("Begin marking at what index?");
            try {
                sIndex = input.nextInt();
                break;
            } catch (InputMismatchException e) {
                System.out.println(e.toString());
            }
        } while (true);


        CoordinateSystem javaFX = new CoordinateSystem(new Point(0, 0), new Point(displayImageWidth, 0), new Point(0, displayImageHeight), new Point(displayImageWidth, displayImageHeight));

        CoordinateSystem test = new CoordinateSystem(points[0], points[1], points[2],
                points[3]);

        Map map = new Map(javaFX, test);

        imagePane.getChildren().add(imageView);
        Counter counter = new Counter(sIndex);
        ArrayList<Text> appliedText = new ArrayList<>();

        imagePane.setOnMouseClicked(event -> {
            double cx = event.getX();
            double cy = event.getY();

            for (Text t : appliedText) {
                if (t.contains(cx, cy)) {

                    appliedText.remove(t);
                    counter.decrement();
                    imagePane.getChildren().clear();
                    imagePane.getChildren().add(imageView);
                    imagePane.getChildren().addAll(appliedText);
                    System.out.println("Deleted: " + t.getText());
                    return;
                }
            }

            Point p = map.convert(new Point(cx, cy));
            System.out.printf("%n%s",
                    OpenLocationCode.encode(p.x, p.y));

            Text numberLabelingText = new Text(String.valueOf(counter.getValue()));
            numberLabelingText.setFill(Color.RED);
            double xLoc = cx;
            double yLoc = cy + (numberLabelingText.getLayoutBounds().getHeight() / 2);

            numberLabelingText.setX(xLoc);
            numberLabelingText.setY(yLoc);

            appliedText.add(numberLabelingText);
            imagePane.getChildren().add(numberLabelingText);

            counter.increment();
        });

        Scene scene = new Scene(root, displayImageWidth, displayImageHeight + controlHeight);

        stage.setTitle("");
        stage.setScene(scene);
        stage.setAlwaysOnTop(true);
        stage.show();

        String finalFilename = inputFileName;
        String finalSaveLocation = saveLocation;
        saveButton.setOnMouseClicked(event -> {
            try
            {
                saveImage(javaFX, new File(finalFilename), appliedText, finalSaveLocation);
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        });

    }

    private void saveImage(CoordinateSystem javaFXCoordinateSystem, File in,
                           ArrayList<Text> appliedText, String saveLocation) throws Exception
    {
        BufferedImage image = ImageIO.read(in);

        CoordinateSystem imageCoordinateSystem = new CoordinateSystem(new Point(0, 0),
                new Point(image.getWidth(), 0), new Point(0, image.getHeight()),
                new Point(image.getWidth(), image.getHeight()));

        Map map = new Map(javaFXCoordinateSystem, imageCoordinateSystem);
        Graphics2D g2d = image.createGraphics();

        java.awt.Font font = new java.awt.Font("Arial", Font.BOLD, 20);
        g2d.setFont(font);
        g2d.setColor(java.awt.Color.RED);

        for (Text text : appliedText) {
            String num = text.getText();
            double x = text.getX();
            double y = text.getY();
            Point p = map.convert(new Point(x, y));

            g2d.drawString(num, (float) p.x, (float) p.y);
        }

        g2d.dispose();

        // WRITE IMAGE
        try {


            // Writing to file taking type and path as
            ImageIO.write(image, "png", new File(saveLocation));

            System.out.println("Save complete.");
        }
        catch (IOException e) {
            System.out.println("Error: " + e);
        }
    }


    public static void main(String[] args)
    {
        launch(args);
    }

    public static class Counter {
        int v;
        public Counter(int init) {
            v = init;
        }
        public void increment() {
            v++;
        }
        public void decrement() {
            v--;
        }
        public int getValue() {
            return v;
        }
    }

    public static void printMatrix(double[] arr)
    {
        System.out.printf("[%f, %f]%n[%f,%f]%n", arr[0], arr[1], arr[2], arr[3]);
    }
}
