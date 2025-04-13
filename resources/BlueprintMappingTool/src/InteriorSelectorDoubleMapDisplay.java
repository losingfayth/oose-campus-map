import components.Controls;
import components.Counter;
import components.SelectorPane;
import fixed.ScrollableImageView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import mapping.Point;
import mapping.*;

import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;

/*

    Usage:
    Before starting, ensure the blueprint is cropped in such a way that it matches the
    selection from the marked up image of the campus. Also ensure the blueprint PNG is
    oriented such that the top left corner of the blueprint corresponds to the corner
    of the building that is labeled top left in that same marked up image of campus
    (the top left corner will be numbered so that the label % 3 == 1)

    On start-up, enter the file path to the blueprint on your system.
    You will be prompted whether you want to enter the reference point coordinates in
    plus codes, or lat/longitude pairs. The latitude/longitude pairs corresponding to
    each blueprint are stored in the resources/Building Corners/buildCorners.csv file.
    That same folder also holds the previously mentioned marked up campus image.

    Enter the reference corners in the format chosen - top left corner first, then top
    right, then bottom left. This is also the order the points are stored in the csv.

    The final prompt asks you where you would like to begin numbering your points. For
    example, Navy Hall starts at ID = 100.

    An example set of inputs:

    /oose-campus-map/resources/blueprintCropped_png/Sutliff Hall/SH-3RD FL.png
    L
    41.007749, -76.446363
    41.007440, -76.447036
    41.008018, -76.446582
    672

    **************

    Once the program launches - Choose the "Node" toggle to add nodes. The type of node
     (Bathroom, stairs, point, etc) must be chosen before a node can be placed. The
     Point toggle refers to any general point that doesn't fit the other categories.

     Choose the "Edges" toggle to add edges connecting nodes. First, select the "root"
     node, by holding the "r" key and clicking a node. Then, after releasing "r", click
      on another node to add an edge between them.

      Adjust zoom by using a wheel (if you have a mouse) or with a two fingered
      "scroll" gesture.

      You can save your progress, which will:
       1. Generate a new PNG with the edges and
            nodes you've marked labeled.
       2. Print the nodes and edges you've marked in a clean format, such that it can
       be copied and pasted (by hand, sorry) into the CSV in the appropriate rows
       3. Generate a text file of that same output.

    Tips:

    Press and hold CTRL to pan. When node is toggled on, click on a previously placed node to delete it.    When edge is toggled on, press and hold "r" to choose a root; press and hold "d" while clicking a node    to delete all edges attached to that node.
 */

public class InteriorSelectorDoubleMapDisplay extends Application
{


    int maxDisplayDim = 800;
    int controlHeight = 50;
    int displayImageHeight;
    int displayImageWidth;
    CoordinateSystem imageCoordinateSystem;
    CoordinateSystem realWorldCoordinates;
    Map map;
    boolean rootSelectMode = false;
    boolean deleteEdgeMode = false;
    ArrayList<KeyCode> list = new ArrayList<>();
    Counter saveCounter = new Counter(1);


    @Override
    public void start(Stage stage) throws Exception
    {

/*
'/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/resources/Floor Plan Networks/pngCropped/Hartline/BS FL.png'
L
41.00723073341936 -76.44782408196845
41.00730710607756 -76.44756333833864
41.00681283614087 -76.44751589823797
1501

 */

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


        int sIndex = Controls.getStartingIndexFromConsole(input);

        System.out.println("Click the three locations on the image that match the " +
                "locationCodes or latitude/longitude points entered above.");

        Counter counter = new Counter(sIndex);

        String[] nodeTypes = new String[]{
                "Point", "Entrance", "Stairs",
                "Elevator", "Bathroom"
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