package components;

import fixed.Edge;
import fixed.Location;
import fixed.LocationGraph;
import fixed.ScrollableImageView;
import javafx.geometry.Point2D;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.ToggleButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import mapping.*;
import mapping.Point;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Line2D;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.ThreadLocalRandom;

public class SelectorPane extends Pane
{
    private Map map;
    private boolean mapDefined;
    private boolean domainDefined;
    private boolean rangeDefined;
    private CoordinateSystem domain;
    private CoordinateSystem range;
    private ArrayList<Point> referencePoints;
    private ScrollableImageView imageView;
    private LocationGraph enteredLocations;
    private boolean nodesSelected = false;
    private boolean edgesSelected = false;
    private ArrayList<Edge> edges;

    private boolean panEnabled = false;
    private Counter idCounter;
    private ToggleGroup pointToggleGroup;
    private HBox pointTypeHBox;
    private boolean rootSelectMode = false;
    private boolean deleteEdgeMode = false;
    private HBox controlPanel;
    private Counter saveCounter;

    public SelectorPane(ScrollableImageView imageView, CoordinateSystem range,
                        Counter idCounter, String[] toggleTypes, Color[] toggleColors,
                        String inputFileName, String saveLocation) {
        super(imageView);
        this.imageView = imageView;
        this.mapDefined = false;
        this.rangeDefined = true;
        this.domainDefined = false;
        this.range = range;
        this.referencePoints = new ArrayList<>();
        this.edges = new ArrayList<>();
        this.enteredLocations = new LocationGraph();
        this.idCounter = idCounter;
        this.saveCounter = new Counter(1);
        this.controlPanel = initControlPane(toggleTypes, toggleColors, inputFileName,
                saveLocation);

        this.setOnMouseClicked(event -> {
            try {
                mouseClickHandler(event);
            }
            catch (Exception e)
            {
                System.out.println("Here");
                System.out.println("CoordinateSystem must span two dimensions");
            }
        });
    }

    private HBox initControlPane(String[] toggleTypes, Color[] toggleColors,
                                 String ogImageLocation, String saveLocation) {

        ToggleGroup nodesEdgesGroup = new ToggleGroup();
        ToggleButton nodes =  initAndSet("Place Nodes", nodesEdgesGroup);
        ToggleButton edges =  initAndSet("Place Edges", nodesEdgesGroup);
        HBox nodesEdgeHBox = new HBox(nodes, edges);
        HBox controlPane = new HBox();
        controlPane.setSpacing(10);

        javafx.scene.control.Button saveButton = new Button("saveImage");

        controlPane.getChildren().addAll(saveButton, initPointTypeHBox(toggleTypes, toggleColors),
                nodesEdgeHBox);

        nodes.setOnMouseClicked(event -> {
            System.out.println("Place Nodes");
            setNodeSelected(true);
        });

        edges.setOnMouseClicked(event -> {
            System.out.println("Place edges");
            setEdgesSelected(true);
        });

        saveButton.setOnMouseClicked(event -> {
            try
            {
                saveImage(new File(ogImageLocation),
                        saveLocation + saveCounter.getValue());
                saveCounter.increment();
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        });

        return controlPane;
    }

    private Node initPointTypeHBox(String[] toggleTypes, Color[] toggleColors)
    {
        this.pointTypeHBox = new HBox();

        if (toggleTypes.length > toggleColors.length) {
            Color[] expandedColors = new Color[toggleTypes.length];
            int i;
            for (i = 0; i < toggleColors.length; i++) {
                expandedColors[i] = toggleColors[i];
            }
            for (; i < toggleTypes.length; i++) {
                ThreadLocalRandom r = ThreadLocalRandom.current();
                expandedColors[i] = getRandomColor(r);
            }
            toggleColors = expandedColors;
        }

        this.pointToggleGroup = new ToggleGroup();
        for (int i = 0; i < toggleTypes.length; i++) {
            ToggleLabel l = initAndSet(toggleTypes[i], pointToggleGroup, toggleColors[i]);
            l.setOnMouseClicked(event -> {
                System.out.println(l.getText());
            });
            pointTypeHBox.getChildren().add(l);
        }

        return this.pointTypeHBox;
    }

    private Color getRandomColor(ThreadLocalRandom r)
    {
        return Color.color(r.nextInt(255), r.nextInt(255), r.nextInt(255));
    }



    private void mouseClickHandler(MouseEvent event) throws Exception
    {

        if (panEnabled)
        {
            return;
        }
        System.out.println("mouseClickHandler");
        double cx = event.getX();
        double cy = event.getY();
        Point2D onImage = imageView.imageViewToImage(new Point2D(cx, cy));

        if (!domainDefined) {
            System.out.println("1");
            referencePoints.add(new Point(onImage.getX(), onImage.getY()));
            System.out.println("clicked " + cx + ", " + cy);
            System.out.println("At pixel x,y: " + onImage.getX() + ", " + onImage.getY());

            if (referencePoints.size() == 3) {
                System.out.println("ReferencePoints.size==3 " + domainDefined);
                domain = new CoordinateSystem(referencePoints.get(0),
                        referencePoints.get(1), referencePoints.get(2));
                domainDefined = true;
                map = new Map(domain, range);
                this.mapDefined = true;
                System.out.println("Mapping Generated");
            }
            return;
        }

        System.out.println("2");

            if (nodesSelected) {
                for (Location l : enteredLocations.getNodes()) {
                    if (l.contains(cx, cy)) {
                        for (Location connectedTo : l.getConnectedTo()) {
                            connectedTo.removeConnection(l);
                        }
                        edges.removeIf(e -> e.containsNode(l));

                        enteredLocations.removeLocation(l);

                        getChildren().clear();
                        getChildren().add(imageView);
                        getChildren().addAll(enteredLocations.getNodes());
                        getChildren().addAll(edges);
                        System.out.println("Deleted: " + l.getText());
                        idCounter.decrement();
                        return;
                    }
                }

                Point p = map.convert(new Point(onImage.getX(), onImage.getY()));
                String code = OpenLocationCode.encode(p.x, p.y);

                System.out.printf("%n%d %s %f, %f ", idCounter.getValue(), code, p.x, p.y);
                if (idCounter.getValue() % 3 == 0) {
                    System.out.println();
                }
                String counterValue = String.valueOf(idCounter.getValue());
                Location labelLocationText;

                Color c;

                if (pointToggleGroup.getSelectedToggle() != null) {
                    ToggleLabel l = (ToggleLabel) pointToggleGroup.getSelectedToggle();
                    labelLocationText = new Location(counterValue, l.getText(), p,
                            onImage);
                    c = l.getColor();
                } else {
                    System.out.println("Type of node must be selected");
                    return;
                }

                labelLocationText.setFill(c);
                double xLoc = cx;
                double yLoc = cy + (labelLocationText.getLayoutBounds().getHeight() / 2);

                labelLocationText.setX(xLoc);
                labelLocationText.setY(yLoc);

                enteredLocations.addLocation(labelLocationText);
                getChildren().add(labelLocationText);

                idCounter.increment();
            } else if (edgesSelected) {
                if (rootSelectMode) {
                    boolean rootSelected = enteredLocations.setCurrentRoot(cx, cy);
                    if (rootSelected) {
                        System.out.println("Selected Root node ID: " + enteredLocations.getCurrentRoot().getKeyID());
                    }
                } else {
                    if (enteredLocations.isInGraph(cx, cy)) {
                        Location clicked = enteredLocations.getLocation(cx, cy);
                        if (deleteEdgeMode) {
                            edges.removeIf(e -> e.containsNode(clicked));
                            ArrayList<Location> toRemove = new ArrayList<>();
                            for (Location connectedTo : clicked.getConnectedTo()) {
                                toRemove.add(connectedTo);
                                connectedTo.removeConnection(clicked);
                            }
                            clicked.getConnectedTo().removeAll(toRemove);

                            getChildren().clear();

                            getChildren().add(imageView);
                            getChildren().addAll(enteredLocations.getNodes());
                            getChildren().addAll(edges);
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
                                getChildren().add(edge);
                                edges.add(edge);
                            }
                        }


                    }
                }
            }





    }

    public void setDomain(CoordinateSystem domain) {
        this.domain = domain;
        this.domainDefined = true;

        if (rangeDefined) {
            this.map = new Map(this.domain, this.range);
            this.mapDefined = true;
        }
    }

    public void setRange(CoordinateSystem range) {
        this.range = range;
        this.rangeDefined = true;

        if (domainDefined) {
            this.map = new Map(this.domain, this.range);
            this.mapDefined = true;
        }
    }

    public Point map(Point input) throws Exception
    {
        if (!(this.rangeDefined && this.domainDefined)) {
            throw new Exception("Cannot map point " + input.x + ", " + input.y + " with undefined " +
                    "coordinate system");
        }
        if (!mapDefined) {
            map = new Map(domain, range);
        }
        return map.convert(input);
    }


    public void setScroll(boolean b)
    {
        this.panEnabled = b;
    }

    public void setNodeSelected(boolean b)
    {
        nodesSelected = b;
        if (nodesSelected) {
            setEdgesSelected(false);
        }
    }

    public void setEdgesSelected(boolean b)
    {
        edgesSelected = b;
        if (edgesSelected) {
            setNodeSelected(false);
        }
    }

    public void saveImage(File in, String saveLocation) throws IOException
    {
        BufferedImage image = ImageIO.read(in);

        Graphics2D g2d = image.createGraphics();

        java.awt.Font font = new java.awt.Font("Arial", Font.BOLD, 20);
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
        for (Edge e : edges) {
//            Point p1 = map.convert(new Point(line.getStartX(), line.getStartY()));
//            Point p2 = map.convert(new Point(line.getEndX(), line.getEndY()));
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

    private ToggleButton initAndSet(String txt, ToggleGroup group) {
        ToggleButton b = new ToggleButton(txt);
        b.setToggleGroup(group);

        return b;
    }

    private ToggleLabel initAndSet(String txt, ToggleGroup group, Color color) {
        ToggleLabel b = new ToggleLabel(txt, color);
        b.setToggleGroup(group);

        return b;
    }

    public boolean isRootMode()
    {
        return rootSelectMode;
    }

    public boolean isDeleteEdgeMode() {
        return deleteEdgeMode;
    }

    public void setRootMode(boolean b) {
        rootSelectMode = b;
    }

    public void setDeleteEdgeMode(boolean b) {
        deleteEdgeMode = b;
    }

    public Node getPointTypeHBox()
    {
        return pointTypeHBox;
    }

    public LocationGraph getEnteredLocations()
    {
        return enteredLocations;
    }

    public ArrayList<Edge> getEdges()
    {
        return edges;
    }

    public Node getControlPane()
    {
        return controlPanel;
    }

    public boolean isPanEnabled()
    {
        return panEnabled;
    }
}
