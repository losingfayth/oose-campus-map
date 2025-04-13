import components.Controls;
import components.Counter;
import components.SelectorPane;

import fixed.ScrollableImageView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import mapping.*;
import mapping.Point;

import java.io.*;
import java.util.*;

public class ExteriorSelectorDisplay extends Application
{


    int maxDisplayDim = 800;
    int controlHeight = 50;

    CoordinateSystem realWorldCoordinates;


    @Override
    public void start(Stage stage) throws Exception
    {
        String saveLocation = "";

        FileInputStream inputStream;
        String inputFileName = "";

        Scanner input = new Scanner(System.in);

        inputFileName = Controls.getInputFileNameFromConsole(input);
        inputStream = new FileInputStream(inputFileName);

        saveLocation = inputFileName.substring(0, inputFileName.length() - 4) +
                "_POINTSLABELED";

        System.out.println(inputFileName + " accessed.");
        Image image = new Image(inputStream);


        ScrollableImageView imageView = new ScrollableImageView(image,
                maxDisplayDim);
        BorderPane root = new BorderPane();


        imageView.setPreserveRatio(true);

        Point[] points = Controls.getPointsFromConsole(input);
        realWorldCoordinates = new CoordinateSystem(points[0], points[1], points[2]);

        /*
/Users/dakotahkurtz/Downloads/campusBuildingsOutlinedPNG.png
L
41.00786, -76.44842
41.00908, -76.44579
41.0066, -76.44766
         */


        int sIndex = Controls.getStartingIndexFromConsole(input);

        System.out.println("Click the three locations on the image that match the " +
                "locationCodes or latitude/longitude points entered above.");

        Counter counter = new Counter(sIndex);

        String[] nodeTypes = new String[]{
                "Point", "Main Entrance", "Side Entrance",
                "Stairs"
        };
        Color[] nodeLabelColors = new Color[]{
                Color.RED, Color.GREEN, Color.BLUE,
                Color.ORANGE, Color.PURPLE
        };


        SelectorPane imagePane = new SelectorPane(imageView, realWorldCoordinates,
                counter, nodeTypes, nodeLabelColors, inputFileName, saveLocation);


        root.setCenter(imagePane);
        root.setBottom(imagePane.getControlPane());

        imageView.fitWidthProperty().bind(imagePane.widthProperty());
        imageView.fitHeightProperty().bind(imagePane.heightProperty());


        Scene scene = new Scene(root, imageView.getDisplayWidth(),
                imageView.getDisplayHeight() + controlHeight);

        stage.setTitle("");
        stage.setScene(scene);
        stage.setAlwaysOnTop(false);
        stage.show();

        Controls.InitializeControls(scene, imageView, imagePane);
    }


    public static void main(String[] args)
    {
        launch(args);
    }


    public static void printMatrix(double[] arr)
    {
        System.out.printf("[%f, %f]%n[%f,%f]%n", arr[0], arr[1], arr[2], arr[3]);
    }
}



