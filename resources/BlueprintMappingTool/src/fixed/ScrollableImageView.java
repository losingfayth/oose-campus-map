package fixed;

import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.geometry.Point2D;
import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.ScrollEvent;
import javafx.scene.shape.Shape;
import mapping.Vector;

import java.util.ArrayList;

public class ScrollableImageView extends ImageView
{

    double displayImageWidth;
    double displayImageHeight;
    static int MIN_PIXELS = 10;
    ObjectProperty<Point2D> mouseDown = new SimpleObjectProperty<>();

    public ScrollableImageView(Image image, double maxDisplayDim) {
        super(image);
        double ix =  image.getWidth();
        double iy = image.getHeight();

        if (ix >= (iy))
        {
            this.displayImageWidth = maxDisplayDim;
            this.displayImageHeight = (int) Math.floor((iy / ix) * maxDisplayDim);
        } else
        {
            this.displayImageHeight = maxDisplayDim;
            this.displayImageWidth = (int) Math.floor((ix / iy) * maxDisplayDim);
        }

        reset();

        setOnMousePressed(e ->
        {

            Point2D mousePress = imageViewToImage(new Point2D(e.getX(),
                    e.getY()));
            mouseDown.set(mousePress);
        });

    }

    // reset to the top left:
    public void reset()
    {
        this.setViewport(new Rectangle2D(0, 0, getImage().getWidth(), getImage().getHeight()));
    }


    public void pan(Point2D clicked, ArrayList<Location> fixedLocations,
                    ArrayList<Edge> fixedEdges)
    {

        Point2D dragPoint = imageViewToImage(clicked);
        Point2D delta = dragPoint.subtract(mouseDown.get());

//        Point2D dragPoint = imageView.imageViewToImage(new Point2D(e.getX(),
//                e.getY()));
//
//        imageView.pan(dragPoint.subtract(mouseDown.get()), fixedShapes);
//
//        mouseDown.set(imageView.imageViewToImage(new Point2D(e.getX(),
//                e.getY())));

        Rectangle2D viewport = this.getViewport();

        double width = this.getImage().getWidth();
        double height = this.getImage().getHeight();

        double maxX = width - viewport.getWidth();
        double maxY = height - viewport.getHeight();

        double minX = clamp(viewport.getMinX() - delta.getX(), 0, maxX);
        double minY = clamp(viewport.getMinY() - delta.getY(), 0, maxY);

        setViewport(new Rectangle2D(minX, minY, viewport.getWidth(), viewport.getHeight()));

        mouseDown.set(imageViewToImage(clicked));
        updateDisplayLocations(fixedLocations, fixedEdges);
    }

    private void updateDisplayLocations(ArrayList<Location> fixedLocations,
                                     ArrayList<Edge> fixedEdges)
    {
        Rectangle2D viewport = getViewport();


        for (Location t : fixedLocations)
        {
            Point2D displayPoint = scalePointToDisplay(t.getFixedPoint(), viewport);

            t.setX(displayPoint.getX());
            t.setY(displayPoint.getY());
        }

        for (Edge e : fixedEdges) {
            Point2D displayStart = scalePointToDisplay(e.getFixedStart(), viewport);
            Point2D displayEnd = scalePointToDisplay(e.getFixedEnd(), viewport);

            e.setStartX(displayStart.getX());
            e.setStartY(displayStart.getY());
            e.setEndX(displayEnd.getX());
            e.setEndY(displayEnd.getY());
        }

    }

    private Point2D scalePointToDisplay(Point2D fixedPoint, Rectangle2D viewport) {
        double spaceX = (fixedPoint.getX() - viewport.getMinX()) / (viewport.getWidth());
        double spaceY = (viewport.getMaxY() - fixedPoint.getY()) / viewport.getHeight();

        double displayX = displayImageWidth * spaceX;
        double displayY = displayImageHeight - displayImageHeight*spaceY;

        return new Point2D(displayX, displayY);
    }



    private static double clamp(double value, double min, double max)
    {

        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    }

    public void zoom(double centerX, double centerY, double delta,
                                     ArrayList<Location> fixedLocations,
                     ArrayList<Edge> fixedEdges)
    {
        Rectangle2D viewport = getViewport();

        double scale = clamp(Math.pow(1.01, delta),

                // don't scale so we're zoomed in to fewer than MIN_PIXELS in any direction:
                Math.min(MIN_PIXELS / viewport.getWidth(), MIN_PIXELS / viewport.getHeight()),

                // don't scale so that we're bigger than image dimensions:
                Math.max(getImage().getWidth() / viewport.getWidth(),
                        getImage().getHeight() / viewport.getHeight())

        );

        Point2D mouse = imageViewToImage(new Point2D(centerX, centerY));

        double newWidth = viewport.getWidth() * scale;
        double newHeight = viewport.getHeight() * scale;

        // To keep the visual point under the mouse from moving, we need
        // (x - newViewportMinX) / (x - currentViewportMinX) = scale
        // where x is the mouse X coordinate in the image

        // solving this for newViewportMinX gives

        // newViewportMinX = x - (x - currentViewportMinX) * scale

        // we then clamp this value so the image never scrolls out
        // of the imageview:

        double newMinX = clamp(mouse.getX() - (mouse.getX() - viewport.getMinX()) * scale,
                0, getImage().getWidth() - newWidth);
        double newMinY = clamp(mouse.getY() - (mouse.getY() - viewport.getMinY()) * scale,
                0, getImage().getHeight() - newHeight);

        setViewport(new Rectangle2D(newMinX, newMinY, newWidth, newHeight));

        updateDisplayLocations(fixedLocations, fixedEdges);

    }

    public Point2D imageViewToImage(Vector v) {
        return imageViewToImage(new Point2D(v.getX(), v.getY()));
    }

    // convert mouse coordinates in the imageView to coordinates in the actual image:
    public Point2D imageViewToImage(Point2D imageViewCoordinates)
    {
        double xProportion = imageViewCoordinates.getX() / getBoundsInLocal().getWidth();
        double yProportion = imageViewCoordinates.getY() / getBoundsInLocal().getHeight();

        Rectangle2D viewport = getViewport();
        return new Point2D(
                viewport.getMinX() + xProportion * viewport.getWidth(),
                viewport.getMinY() + yProportion * viewport.getHeight());
    }

    public double getDisplayWidth()
    {
        return displayImageWidth;
    }

    public double getDisplayHeight() {
        return displayImageHeight;
    }
}
