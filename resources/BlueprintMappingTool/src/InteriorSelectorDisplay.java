import fixed.Edge;
import fixed.Location;
import fixed.LocationGraph;
import fixed.ScrollableImageView;
import javafx.application.Application;
import javafx.geometry.Point2D;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ToggleButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.image.Image;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import mapping.Point;
import mapping.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Line2D;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.InputMismatchException;
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
/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/resources/blueprintCropped_png/Sutliff Hall/SH-3RD FL.png
L
41.007749, -76.446363
41.007440, -76.447036
41.008018, -76.446582
 */


        HBox controlPane = new HBox();
        controlPane.setSpacing(10);

        Button saveButton = new Button("saveImage");

        String[] nodeTypes = new String[]{"Point", "Entrance", "Bathroom", "Stairs",
                "Elevator"};
        Color[] nodeLabelColors = new Color[]{Color.RED, Color.GREEN, Color.BLUE,
                Color.ORANGE, Color.PURPLE};

        ArrayList<ToggleLabel> nodeToggles = new ArrayList<>(nodeTypes.length);
        ToggleGroup pointTypeGroup = new ToggleGroup();
        HBox pointTypeHBox = new HBox();

        for (int i = 0; i < nodeTypes.length; i++) {
            ToggleLabel l = initAndSet(nodeTypes[i], pointTypeGroup, nodeLabelColors[i]);
            l.setOnMouseClicked(event -> {
                System.out.println(l.getText());
            });
            pointTypeHBox.getChildren().add(l);
        }

        ToggleGroup nodesEdgesGroup = new ToggleGroup();
        ToggleButton nodes =  initAndSet("Place Nodes", nodesEdgesGroup);
        ToggleButton edges =  initAndSet("Place Edges", nodesEdgesGroup);
        HBox nodesEdgeHBox = new HBox(nodes, edges);

        controlPane.getChildren().addAll(saveButton, pointTypeHBox, nodesEdgeHBox);

        nodes.setOnMouseClicked(event -> {
            System.out.println("Place Nodes");
        });

        edges.setOnMouseClicked(event -> {
            System.out.println("Place edges");
        });



        String saveLocation = "";

        FileInputStream inputStream;
        String inputFileName = "";

        Scanner input = new Scanner(System.in);

        inputFileName = getInputFileNameFromConsole(input);
        inputStream = new FileInputStream(inputFileName);

        saveLocation = inputFileName.substring(0, inputFileName.length() - 4) +
                "_POINTSLABELED";

        System.out.println(inputFileName + " accessed.");
        Image image = new Image(inputStream);

        double ix =  image.getWidth();
        double iy = image.getHeight();
        System.out.println("Image loaded: w: "+ix + ", h: " + iy);

        if (ix >= (iy))
        {
            displayImageWidth = maxDisplayDim;
            displayImageHeight = (int) Math.floor((iy / ix) * maxDisplayDim);
        } else
        {
            displayImageHeight = maxDisplayDim;
            displayImageWidth = (int) Math.floor((ix / iy) * maxDisplayDim);
        }

        ScrollableImageView imageView = new ScrollableImageView(image,
                displayImageWidth, displayImageHeight);
        BorderPane root = new BorderPane();

        Pane imagePane = new Pane(imageView);

        root.setCenter(imagePane);
        root.setBottom(controlPane);

        imageView.fitWidthProperty().bind(imagePane.widthProperty());
        imageView.fitHeightProperty().bind(imagePane.heightProperty());
        imageView.setPreserveRatio(true);

        Point[] points = getPointsFromConsole(input);

        int sIndex = getStartingIndexFromConsole(input);

        ArrayList<Point> referencePoints = new ArrayList<>();
        referencePoints.add(new Point(0, 0));
        referencePoints.add(new Point(imageView.getImage().getWidth(), 0));
        referencePoints.add(new Point(0, imageView.getImage().getHeight()));

        imageCoordinateSystem =
                new CoordinateSystem(referencePoints.get(0),
                        referencePoints.get(1), referencePoints.get(2));
        realWorldCoordinates = new CoordinateSystem(points[0], points[1], points[2]);
        map = new Map(imageCoordinateSystem, realWorldCoordinates);
        System.out.println("Mapping generated.");

        Counter counter = new Counter(sIndex);

        LocationGraph enteredLocations = new LocationGraph();
        ArrayList<Edge> lines = new ArrayList<>();



        imagePane.setOnMouseClicked(event -> {

            if (list.contains(KeyCode.CONTROL))
            {
                return;
            }

            double cx = event.getX();
            double cy = event.getY();
            Point2D onImage = imageView.imageViewToImage(new Point2D(cx, cy));

                if (nodes.isSelected()) {
                    for (Location l : enteredLocations.getNodes()) {
                        if (l.contains(cx, cy)) {
                            for (Location connectedTo : l.getConnectedTo()) {
                                connectedTo.removeConnection(l);
                            }
                            lines.removeIf(e -> e.containsNode(l));

                            enteredLocations.removeLocation(l);

                            imagePane.getChildren().clear();
                            imagePane.getChildren().add(imageView);
                            imagePane.getChildren().addAll(enteredLocations.getNodes());
                            imagePane.getChildren().addAll(lines);
                            System.out.println("Deleted: " + l.getText());
                            return;
                        }
                    }

                    Point p = map.convert(new Point(onImage.getX(), onImage.getY()));

                    if (counter.getValue() % 3 == 0) {
                        System.out.println();
                    }
                    String counterValue = String.valueOf(counter.getValue());
                    Location labelLocationText;

                    Color c;

                    if (pointTypeGroup.getSelectedToggle() != null) {
                        ToggleLabel l = (ToggleLabel) pointTypeGroup.getSelectedToggle();
                        labelLocationText = new Location(counterValue, l.getText(), p,
                                onImage);
                        c = l.getColor();
                    } else {
                        System.out.println("Type of node must be selected");
                        return;
                    }

                    System.out.printf("%n%s %f %f ",
                            labelLocationText.getLocationCode(), p.x, p.y);

                    labelLocationText.setFill(c);
                    double xLoc = cx;
                    double yLoc = cy + (labelLocationText.getLayoutBounds().getHeight() / 2);

                    labelLocationText.setX(xLoc);
                    labelLocationText.setY(yLoc);

                    enteredLocations.addLocation(labelLocationText);
                    imagePane.getChildren().add(labelLocationText);

                    counter.increment();
                } else if (edges.isSelected()) {
                    if (rootSelectMode) {
                        boolean rootSelected = enteredLocations.setCurrentRoot(cx, cy);
                        if (rootSelected) {
                            System.out.println("Selected Root node ID: " + enteredLocations.getCurrentRoot().getKeyID());
                        }
                    } else {
                        if (enteredLocations.isInGraph(cx, cy)) {
                            Location clicked = enteredLocations.getLocation(cx, cy);
                            if (deleteEdgeMode) {
                                lines.removeIf(e -> e.containsNode(clicked));
                                ArrayList<Location> toRemove = new ArrayList<>();
                                for (Location connectedTo : clicked.getConnectedTo()) {
                                    toRemove.add(connectedTo);
                                    connectedTo.removeConnection(clicked);
                                }
                                clicked.getConnectedTo().removeAll(toRemove);
                                
                                imagePane.getChildren().clear();

                                imagePane.getChildren().add(imageView);
                                imagePane.getChildren().addAll(enteredLocations.getNodes());
                                imagePane.getChildren().addAll(lines);
                            } else {
                                if (enteredLocations.getCurrentRoot() != null && !clicked.equals(enteredLocations.getCurrentRoot())) {
                                    enteredLocations.getCurrentRoot().markConnection(clicked);
                                    clicked.markConnection(enteredLocations.getCurrentRoot());
                                    System.out.printf("%nEdge added | %d -> %d, %d -> %d " +
                                                    "%n",
                                            enteredLocations.getCurrentRoot().getKeyID(), clicked.getKeyID(), clicked.getKeyID(), enteredLocations.getCurrentRoot().getKeyID());

                                    Vector v1 = new Vector(cx, cy);
                                    Vector v2 = new Vector(enteredLocations.getCurrentRoot().getX(),
                                            enteredLocations.getCurrentRoot().getY());

                                    double spacing = 4;

                                    v1 = Edge.scaleDown(v1, v2, spacing);
                                    v2 = Edge.scaleDown(v2, v1, spacing);

                                    Edge edge = new Edge(v1, v2,
                                            enteredLocations.getCurrentRoot(), clicked,
                                            imageView.imageViewToImage(v1),
                                            imageView.imageViewToImage(v2));

                                    edge.getStrokeDashArray().add(2d);
                                    imagePane.getChildren().add(edge);
                                    lines.add(edge);
                                }
                            }


                        }
                    }
                }
        });
//


        String finalFilename = inputFileName;
        String finalSaveLocation = saveLocation;
        saveButton.setOnMouseClicked(event -> {
            try
            {
                saveImage(new File(finalFilename),
                        enteredLocations, lines,
                        finalSaveLocation + String.valueOf(saveCounter.getValue()));
                saveCounter.increment();
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        });

        Scene scene = new Scene(root, displayImageWidth, displayImageHeight + controlHeight);

        stage.setTitle("");
        stage.setScene(scene);
        stage.setAlwaysOnTop(false);
        stage.show();

        scene.setOnKeyPressed(event -> {
            if ((event.getCode() == KeyCode.R) && !rootSelectMode) {

                System.out.println("Start: Root select Mode");
                rootSelectMode = true;
            }
            if (event.getCode() == KeyCode.D && !deleteEdgeMode) {
                System.out.println("Start: delete edge mode");
                deleteEdgeMode = true;
            }
            if (event.getCode() == KeyCode.CONTROL)
            {
                list.add(event.getCode());
            }
        });

        scene.setOnKeyReleased(event -> {

            if ((event.getCode() == KeyCode.R) && rootSelectMode) {
                System.out.println("Stop: Root select Mode");
                rootSelectMode = false;
            }
            if (event.getCode() == KeyCode.D && deleteEdgeMode) {
                System.out.println("Stop: delete edge mode");
                deleteEdgeMode = false;
            }
            if (event.getCode() == KeyCode.CONTROL)
            {
                list.remove(event.getCode());
            }
        });

        imageView.setOnMouseDragged(e ->
        {
            if (list.contains(KeyCode.CONTROL))
            {
                imageView.pan(new Point2D(e.getX(), e.getY()),
                        enteredLocations.getNodes(), lines);

            }

        });

        imageView.setOnScroll(e ->
        {
            imageView.zoom(e.getX(), e.getY(), e.getDeltaY(),
                    enteredLocations.getNodes(), lines);
        });
    }

    private String getInputFileNameFromConsole(Scanner input) {
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
                new FileInputStream(inputFileName);
                break;
            } catch (FileNotFoundException f) {
                System.out.println("\n"+inputFileName + " is invalid file path.");
            }
        }

        return inputFileName;
    }

    private int getStartingIndexFromConsole(Scanner input)
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

    private Point[] getPointsFromConsole(Scanner input)
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
                String string = input.nextLine();
                String lat = string.substring(0, string.indexOf(','));
                String lng = string.substring(string.indexOf(',')+2);
                x = Double.parseDouble(lat);
                y = Double.parseDouble(lng);
                points[i] = new Point(x, y);
            }
        }

        return points;
    }

    private ToggleLabel initAndSet(String txt, ToggleGroup group, Color color) {
        ToggleLabel b = new ToggleLabel(txt, color);
        b.setToggleGroup(group);

        return b;
    }

    private ToggleButton initAndSet(String txt, ToggleGroup group) {
        ToggleButton b = new ToggleButton(txt);
        b.setToggleGroup(group);

        return b;
    }



    private void saveImage(File in,
                           LocationGraph enteredLocations,
                           ArrayList<Edge> lines, String saveLocation) throws Exception
    {
        BufferedImage image = ImageIO.read(in);

        Graphics2D g2d = image.createGraphics();

        Font font = new Font("Arial", Font.BOLD, 20);
        g2d.setFont(font);
        g2d.setColor(java.awt.Color.RED);

        for (Location l : enteredLocations.getNodes()) {
            String num = l.getText();
            Point2D p = l.getFixedPoint();

            g2d.drawString(num, (float) p.getX(), (float) p.getY());
        }

        g2d.setColor(java.awt.Color.BLACK);
        float[] dashingPattern1 = {2f, 2f};
        Stroke stroke1 = new BasicStroke(2f, BasicStroke.CAP_BUTT,
                BasicStroke.JOIN_MITER, 1.0f, dashingPattern1, 2.0f);

        g2d.setStroke(stroke1);
        for (Edge e : lines) {
            Point2D p1 = e.getFixedStart();
            Point2D p2 = e.getFixedEnd();

            g2d.draw(new Line2D.Double(p1.getX(), p1.getY(), p2.getX(), p2.getY()));
        }

        g2d.dispose();

        // WRITE IMAGE
        try {


            // Writing to file taking type and path as
            ImageIO.write(image, "png", new File(saveLocation + ".png"));

            System.out.println("\n**************Image Save complete: " + saveLocation +
                    "\n\n");
        }
        catch (IOException e) {
            System.out.println("Error: " + e);
        }

        String output = enteredLocations.fancyPrint();
        System.out.println(output);

        try (Writer writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(saveLocation + ".txt"), StandardCharsets.UTF_8)))
        {
            writer.write(output);
            System.out.println("\nText file save complete");
        }
        catch (IOException ex)
        {
            System.out.println("File save failed: " + ex.getMessage());

        }

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



