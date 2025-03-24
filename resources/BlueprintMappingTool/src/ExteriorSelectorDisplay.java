import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.RadioButton;
import javafx.scene.control.ToggleButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Line;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import mapping.CoordinateSystem;
import mapping.Map;
import mapping.Point;
import mapping.Vector;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Line2D;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;

public class ExteriorSelectorDisplay extends Application
{


    int maxDisplayDim = 1200;
    int controlHeight = 50;
    int displayImageHeight;
    int displayImageWidth;
    CoordinateSystem javaFXCoordinateSystem;
    CoordinateSystem test;
    Map map;
    boolean rootSelectMode = false;
    boolean deleteEdgeMode = false;


    @Override
    public void start(Stage stage) throws Exception
    {

        BorderPane root = new BorderPane();

        Pane imagePane = new Pane();
        root.setCenter(imagePane);

        HBox controlPane = new HBox();
        root.setBottom(controlPane);

        Button saveButton = new Button("saveImage");

        ToggleGroup pointTypeGroup = new ToggleGroup();
        ToggleButton pointsToggle = initAndSet("Points", pointTypeGroup);
        ToggleButton entranceToggle = initAndSet("Main Entrance", pointTypeGroup);
        ToggleButton sideToggle = initAndSet("Side Entrance", pointTypeGroup);

        pointsToggle.setOnMouseClicked(event -> {
            System.out.println("Points:");
        });
        entranceToggle.setOnMouseClicked(event -> {
            System.out.println("Main entrances");
        });
        sideToggle.setOnMouseClicked(event -> {
            System.out.println("Side entrances");
        });

        ToggleGroup nodesEdgesGroup = new ToggleGroup();
        ToggleButton nodes =  initAndSet("Place Nodes", nodesEdgesGroup);
        ToggleButton edges =  initAndSet("Place Edges", nodesEdgesGroup);

        nodes.setOnMouseClicked(event -> {
            System.out.println("Place Nodes");
        });

        edges.setOnMouseClicked(event -> {
            System.out.println("Place edges");
        });


        String saveLocation = "";

        controlPane.getChildren().addAll(saveButton, pointsToggle, entranceToggle,
                sideToggle, nodes, edges);

        FileInputStream inputStream;
        String inputFileName = "";

        Scanner input = new Scanner(System.in);

        inputFileName = getInputFileNameFromConsole(input);
        inputStream = new FileInputStream(inputFileName);

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



        Point[] points = getPointsFromConsole(input);



        /*
/Users/dakotahkurtz/Downloads/andruss.png
L
41.00854, -76.44725
41.00914, -76.44584
41.00756, -76.44712
1

         */



        System.out.println("Click the four locations on the image that match the " +
                "locationCodes or latitude/longitude points entered above.");

        int sIndex = getStartingIndexFromConsole(input);

        ArrayList<Point> referencePoints = new ArrayList<>();

        imagePane.getChildren().add(imageView);
        SelectorDisplay.Counter counter = new SelectorDisplay.Counter(sIndex);

        LocationGraph enteredLocations = new LocationGraph();
        ArrayList<Edge> lines = new ArrayList<>();

        final boolean[] mapGenerated = {false};
        imagePane.setOnMouseClicked(event -> {
            double cx = event.getX();
            double cy = event.getY();

            if (referencePoints.size() <= 2) {
                referencePoints.add(new Point(cx, cy));
                System.out.println("Added " + cx + ", " + cy);
            }




            if (mapGenerated[0]) {
                if (nodes.isSelected()) {
                    for (Location l : enteredLocations.nodes) {
                        if (l.contains(cx, cy)) {

                            enteredLocations.removeLocation(l);
                            counter.decrement();
                            imagePane.getChildren().clear();
                            imagePane.getChildren().add(imageView);
                            imagePane.getChildren().addAll(enteredLocations.nodes);
                            System.out.println("Deleted: " + l.getText());
                            return;
                        }
                    }

                    Point p = map.convert(new Point(cx, cy));
                    String code = OpenLocationCode.encode(p.x, p.y);
                    System.out.printf("%n%s",
                            code);

                    String counterValue = String.valueOf(counter.getValue());
                    Location labelLocationText;

                    Color c;

                    if (pointsToggle.isSelected()) {
                        labelLocationText = new Location(counterValue, "point", code);
                        c = Color.GREEN;
                    } else if (entranceToggle.isSelected()) {
                        labelLocationText = new Location(counterValue, "main", code);
                        c = Color.RED;
                    } else if (sideToggle.isSelected()) {
                        labelLocationText = new Location(counterValue, "side", code);
                        c = Color.BLUE;
                    } else {
                        System.out.println("Select type of point.");
                        return;
                    }

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
                            System.out.println("Selected Root node ID: " + enteredLocations.currentRoot.id);
                        }
                    } else {
                        if (enteredLocations.isInGraph(cx, cy)) {
                            Location clicked = enteredLocations.getLocation(cx, cy);
                            if (deleteEdgeMode) {
                                lines.removeIf(e -> e.containsNode(clicked));
                                imagePane.getChildren().clear();

                                imagePane.getChildren().add(imageView);
                                imagePane.getChildren().addAll(enteredLocations.nodes);
                                imagePane.getChildren().addAll(lines);
                            } else {
                                if (enteredLocations.currentRoot != null && !clicked.equals(enteredLocations.currentRoot)) {
                                    enteredLocations.currentRoot.addEdge(clicked);
                                    clicked.addEdge(enteredLocations.currentRoot);
                                    System.out.printf("%nEdge added | %d -> %d, %d -> %d " +
                                                    "%n", enteredLocations.currentRoot.id,
                                            clicked.id, clicked.id,
                                            enteredLocations.currentRoot.id);
                                    Vector v1 = new Vector(cx, cy);
                                    Vector v2 = new Vector(enteredLocations.currentRoot.getX(),
                                            enteredLocations.currentRoot.getY());

                                    double spacing = 4;

                                    v1 = Edge.scaleDown(v1, v2, spacing);
                                    v2 = Edge.scaleDown(v2, v1, spacing);

                                    Edge edge = new Edge(v1, v2,
                                            enteredLocations.currentRoot, clicked);

                                    edge.getStrokeDashArray().add(2d);
                                    imagePane.getChildren().add(edge);
                                    lines.add(edge);
                                }
                            }


                        }
                    }
                }
            }



            if (!mapGenerated[0] && referencePoints.size() == 3) {
                mapGenerated[0] = true;
                try
                {
                    javaFXCoordinateSystem =
                            new CoordinateSystem(referencePoints.get(0),
                                    referencePoints.get(1), referencePoints.get(2));
                }
                catch (Exception e)
                {
                    e.printStackTrace();
                }
                try
                {
                    test = new CoordinateSystem(points[0], points[1], points[2]);
                }
                catch (Exception e)
                {
                    e.printStackTrace();
                }
                map = new Map(javaFXCoordinateSystem, test);
                System.out.println("Mapping generated.");
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
                        finalSaveLocation);
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        });




        imageView.setFitWidth(displayImageWidth);
        imageView.setFitHeight(displayImageHeight);

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
                InputStream inputStream = new FileInputStream(inputFileName);
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

        CoordinateSystem displayCoordinateSystem = new CoordinateSystem(new Point(0, 0)
                , new Point(displayImageWidth, 0), new Point(0, displayImageHeight));
        CoordinateSystem imageCoordinateSystem = new CoordinateSystem(new Point(0, 0),
                new Point(image.getWidth(), 0), new Point(0, image.getHeight()));

        Map map = new Map(displayCoordinateSystem, imageCoordinateSystem);
        Graphics2D g2d = image.createGraphics();

        java.awt.Font font = new java.awt.Font("Arial", Font.BOLD, 20);
        g2d.setFont(font);
        g2d.setColor(java.awt.Color.RED);

        for (Text text : enteredLocations.nodes) {
            String num = text.getText();
            double x = text.getX();
            double y = text.getY();
            Point p = map.convert(new Point(x, y));

            g2d.drawString(num, (float) p.x, (float) p.y);
        }

        g2d.setColor(java.awt.Color.BLACK);
        float[] dashingPattern1 = {2f, 2f};
        Stroke stroke1 = new BasicStroke(2f, BasicStroke.CAP_BUTT,
                BasicStroke.JOIN_MITER, 1.0f, dashingPattern1, 2.0f);

        g2d.setStroke(stroke1);
        for (Line line : lines) {
            Point p1 = map.convert(new Point(line.getStartX(), line.getStartY()));
            Point p2 = map.convert(new Point(line.getEndX(), line.getEndY()));

            g2d.draw(new Line2D.Double(p1.x, p1.y, p2.x, p2.y));
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

        enteredLocations.nodes.sort((o1, o2) ->
        {
            if (o1.type.charAt(0) != o2.type.charAt(0))
            {
                return o1.type.charAt(0) - o2.type.charAt(0);
            }
            return o1.id - o2.id;
        });

        System.out.println("\n***********Nodes************\n");
        String previous = enteredLocations.nodes.get(0).type;
        System.out.println("\n" + previous + "\n");
        for (Location l : enteredLocations.nodes) {
            if (!l.type.equals(previous)) {
                previous = l.type;
                System.out.println("\n"+previous+"\n");
            }
            System.out.println(l.id + " " + l.locationCode);
        }

        System.out.println("********\nTotal # of nodes: " + enteredLocations.nodes.size() + " **********\n");

        System.out.println("\n***********Edges************\n");
        int tot = 0;
        for (Location l : enteredLocations.nodes) {
            int n1 = l.id;
            for (Location to : l.edges) {
                tot++;
                System.out.printf("%n%d %d", n1, to.id);
            }
        }
        System.out.println("\nTotal # of Edges: " + tot);
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



