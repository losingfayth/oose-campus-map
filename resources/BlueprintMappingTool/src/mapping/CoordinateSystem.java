package mapping;

public class CoordinateSystem {
    Point topLeft;
    Point topRight;
    Point bottomLeft;
    Point bottomRight;
    Vector iHat;
    Vector jHat;
    double[] inverseMatrix;

    public CoordinateSystem(Point topLeft, Point topRight, Point bottomLeft,
                            Point bottomRight) throws Exception
    {
        this.topLeft = topLeft;
        this.topRight = topRight;
        this.bottomLeft = bottomLeft;
        this.bottomRight = bottomRight;

        iHat = new Vector(topRight.x - topLeft.x,
                topRight.y - topLeft.y);
        jHat = new Vector(bottomLeft.x - topLeft.x,
                bottomLeft.y - topLeft.y);

        double deterCoeff = iHat.x * jHat.y - jHat.x* iHat.y;
        if (deterCoeff == 0) {
            throw new Exception("The coordinate system must span two dimensions");
        }
        double determinant = 1 / deterCoeff;
        inverseMatrix = new double[]{jHat.y, -jHat.x, -iHat.y, iHat.x};
        for (int i = 0; i < inverseMatrix.length; i++) {
            inverseMatrix[i] = inverseMatrix[i] * determinant;
        }


    }

    public Vector getBasisProportion(Point p)
    {
        Vector wrtOrigin = new Vector(p.x - topLeft.x, p.y - topLeft.y);

        return wrtOrigin.multiplyByMatrix(new Vector(inverseMatrix[0],
                inverseMatrix[2]), new Vector(inverseMatrix[1], inverseMatrix[3]));
    }


}