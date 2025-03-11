package LatLongConverter;

public class DistanceFormula
{
    public static void main(String[] args)
    {
        System.out.println(degMinSecToRadians(41, 0, 27.9));
    }

    public static double distance(double latitude1, double longitude1, double latitude2
            , double longitude2) {
        double dlong = longitude2 - longitude1;
        double dlat = latitude2 - latitude1;

        double a =
                Math.pow(Math.sin(dlat / 2), 2) + Math.cos(latitude1) * Math.cos(latitude2) * Math.pow(Math.sin(dlong / 2), 2);

        double radius = 3956; // of earth in miles
        return radius * 2 * Math.asin(Math.sqrt(a));
    }

    public static double degMinSecToRadians(double degree, double minutes,
                                            double seconds) {
        return (degree + (minutes / 60) + (seconds / 3600)) * (Math.PI / 180);
    }

}
