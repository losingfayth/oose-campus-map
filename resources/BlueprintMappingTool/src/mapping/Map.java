package mapping;

public class Map {

    CoordinateSystem original;
    CoordinateSystem change;

    public Map(CoordinateSystem original, CoordinateSystem change) {
        this.original = original;
        this.change = change;
    }

    public Point convert(Point p) {
        return map(original, change, p);
    }

    public Point revert(Point p) {
        return map(change, original, p);
    }

    public Point map(CoordinateSystem domain, CoordinateSystem range, Point p) {
        Vector proportionalityConstant = domain.getBasisProportion(p);
        return new Point(proportionalityConstant.multiplyByMatrix(range.iHat,
                range.jHat).add(new Vector(range.topLeft)));
    }

    public static void printMatrix(double[] arr) {
        System.out.printf("[%f, %f]%n[%f,%f]%n", arr[0], arr[1], arr[2], arr[3]);
    }

}










