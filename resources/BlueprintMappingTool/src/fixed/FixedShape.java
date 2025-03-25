package fixed;

import javafx.scene.shape.Shape;

public class FixedShape
{
    private final double fixedX;
    private final double fixedY;
    private Shape shape;

    public FixedShape(Shape shape, double fixedX, double fixedY) {
        this.shape = shape;
        this.fixedX = fixedX;
        this.fixedY = fixedY;
    }

    public double getFixedY()
    {
        return fixedY;
    }

    public double getFixedX()
    {
        return fixedX;
    }

    public Shape getShape()
    {
        return shape;
    }
}
