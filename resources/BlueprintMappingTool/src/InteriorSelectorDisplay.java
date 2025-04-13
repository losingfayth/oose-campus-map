import components.Controls;
import components.Counter;
import components.SelectorPane;
import fixed.ScrollableImageView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
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

public class InteriorSelectorDisplay extends Application
{


    int maxDisplayDim = 800;
    int controlHeight = 50;

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
'/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/resources/Floor Plan Networks/pngCropped/Hartline/GR FL.png'
L
41.007292, -76.448117
41.007633, -76.447336
41.006672, -76.447640
1563

 */
        HBox controlPane = new HBox();
        controlPane.setSpacing(10);

        String[] nodeTypes = new String[]{"Point", "Entrance", "Bathroom", "Stairs",
                "Elevator"};
        Color[] nodeLabelColors = new Color[]{Color.RED, Color.GREEN, Color.BLUE,
                Color.ORANGE, Color.PURPLE};

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

        int sIndex = Controls.getStartingIndexFromConsole(input);
        Counter counter = new Counter(sIndex);

        ArrayList<Point> referencePoints = new ArrayList<>();
        referencePoints.add(new Point(0, 0));
        referencePoints.add(new Point(imageView.getImage().getWidth(), 0));
        referencePoints.add(new Point(0, imageView.getImage().getHeight()));

        imageCoordinateSystem =
                new CoordinateSystem(referencePoints.get(0),
                        referencePoints.get(1), referencePoints.get(2));

        System.out.println(imageCoordinateSystem);

        realWorldCoordinates = new CoordinateSystem(points[0], points[1], points[2]);

        SelectorPane imagePane = new SelectorPane(imageView, realWorldCoordinates,
                counter, nodeTypes, nodeLabelColors, inputFileName, saveLocation);
        imagePane.setDomain(imageCoordinateSystem);

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



