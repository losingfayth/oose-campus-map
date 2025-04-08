package fixed;

import javafx.geometry.Point2D;
import javafx.scene.shape.Line;
import mapping.Vector;

public class Edge extends Line
{
    Location node1;
    Location node2;
    Point2D fixedStart;
    Point2D fixedEnd;

    public Edge(Vector v1, Vector v2, Location currentRoot, Location clicked,
                Point2D fixedStart, Point2D fixedEnd)
    {
        super(v1.getX(), v1.getY(), v2.getX(), v2.getY());

        this.node1 = currentRoot;
        this.node2 = clicked;

        this.fixedStart = fixedStart;
        this.fixedEnd = fixedEnd;
    }

    public Point2D getFixedStart()
    {
        return fixedStart;
    }

    public Point2D getFixedEnd()
    {
        return fixedEnd;
    }

    public static Vector scaleDown(Vector v1, Vector v2, double spacing) {
        return v1.add(v2.subtract(v1).normalize().scale(spacing));
    }

    public boolean containsNode(Location clicked)
    {
        return node1.equals(clicked) || node2.equals(clicked);
    }
}
