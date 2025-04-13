package mapping;

public class CoordinateSystem {
    Point topLeft;
    Point topRight;
    Point bottomLeft;
    Point bottomRight;
    Vector iHat;
    Vector jHat;
    double[] inverseMatrix;

    public CoordinateSystem(Point origin, Point originPlusIHat, Point originPlusJHat) throws Exception
    {
        this.topLeft = origin;
        this.topRight = originPlusIHat;
        this.bottomLeft = originPlusJHat;

        iHat = new Vector(originPlusIHat.x - origin.x,
                originPlusIHat.y - origin.y);
        jHat = new Vector(originPlusJHat.x - origin.x,
                originPlusJHat.y - origin.y);

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

    @Override
    public String toString()
    {
        return ("iHat: " + iHat + ", jHat: " + jHat);
    }

    public Vector getBasisProportion(Point p)
    {
        Vector wrtOrigin = new Vector(p.x - topLeft.x, p.y - topLeft.y);

        return wrtOrigin.multiplyByMatrix(new Vector(inverseMatrix[0],
                inverseMatrix[2]), new Vector(inverseMatrix[1], inverseMatrix[3]));
    }


}