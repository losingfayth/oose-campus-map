package mapping;

import javafx.scene.image.Image;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class Temp
{
    public static void main(String[] args) throws Exception
    {


        CoordinateSystem domain = new CoordinateSystem(
                new Point(466.5825, 111.83999817795224) ,
                new Point(1141.1175, 113.58749814948276),
                new Point(471.82500000000005, 866.7599858791299)
        );
        CoordinateSystem range = new CoordinateSystem(
                new Point(41.007854149685514, -76.4481847202929),
                new Point(41.008009218293864, -76.44784113111152),
                new Point(41.007558985857244, -76.44794850998309)
        );

        Map m = new Map(domain, range);
        Point topLeft = m.convert(new Point(0, 0));
        Point topRight = m.convert(new Point(2500, 0));
        Point bottomLeft = m.convert(new Point(0, 1877));

        System.out.printf("topLeft, topRight, bottomLeft:%n%s%n%s%n%s", topLeft,
                topRight, bottomLeft);

        //'/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/client/RoonGo/assets/build_images/Student Services/GR FL.png'

        //'/Users/dakotahkurtz/Documents/GitHub/oose-campus-map/resources/Floor Plan Networks/pngCropped/SSC/SSC 0.png'

        Image workImage = loadImage("/Users/dakotahkurtz/Documents/GitHub/oose-campus" +
                "-map/resources/Floor Plan Networks/pngCropped/SSC/SSC 0.png");

        Image displayImage = loadImage("/Users/dakotahkurtz/Documents/GitHub/oose" +
                "-campus-map/client/RoonGo/assets/build_images/Student Services/GR FL.png");

        System.out.printf("wordImage: %f, %f%nDisplay: %f, %f%n", workImage.getWidth(),
                workImage.getHeight(), displayImage.getWidth(), displayImage.getHeight());

    }

    public static Image loadImage(String src) throws FileNotFoundException
    {
        FileInputStream i = new FileInputStream(src);
        return new Image(i);
    }
}
