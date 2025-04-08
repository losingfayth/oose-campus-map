package mapping;

public class Point
{
    public double x, y;
    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Point(Vector v) {
        this.x = v.x;
        this.y = v.y;
    }

    @Override
    public String toString()
    {
        return "Point{" +
                "x=" + x +
                ", y=" + y +
                '}';
    }
}
