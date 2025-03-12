package mapping;

public class Vector
{
    double x;
    double y;
    public Vector(double xComponent, double yComponent) {
        this.x = xComponent;
        this.y = yComponent;
    }

    public Vector(Point p) {
        this.x = p.x;
        this.y = p.y;
    }

    public Vector add(Vector v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }

    public Vector multiplyByMatrix(Vector columnOne, Vector columnTwo) {

        double x = columnOne.x *this.x + columnTwo.x*this.y;
        double y = columnOne.y*this.x + columnTwo.y * this.y;
        return new Vector(x, y);
    }

    public Vector scale(double scalar)
    {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    public Vector subtract(Vector v) {
        return this.add(v.scale(-1));
    }

    @Override
    public String toString()
    {
        return "Vector{" +
                "x=" + x +
                ", y=" + y +
                '}';
    }


}
