// Java Program to list all files
// From a directory recursively
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ManipulateImage
{
    private  String sourceRootString;
    private  String destRootString;

    public ManipulateImage(String sourceRoot, String destRootString) throws IOException,
            InterruptedException
    {
        this.destRootString = destRootString;
        this.sourceRootString = sourceRoot;

        File dest = new File(destRootString);
        if (dest.exists()) {
            Processing.emptyAndDeleteDir(dest);
        }
        dest.mkdir();

        File root = new File(sourceRootString);
        File[] files = root.listFiles();

        assert files != null;
        for (File f : files) {
            processBuilding(f, f.toString().substring(sourceRootString.length()));
        }
    }

    public String getDestRootString()
    {
        return destRootString;
    }

    private void processBuilding(File directory, String dirID) throws IOException, InterruptedException
    {
        File sourceRoot = new File(directory.toString());
        System.out.println("In directory: " + directory + " dirID: " + dirID);

        File destDir = new File(destRootString + dirID);
        if (destDir.exists()) {
            Processing.emptyAndDeleteDir(destDir);
        }
        destDir.mkdir();


        File[] files = sourceRoot.listFiles();
        for (File f : files) {
            String fileName = f.toString().substring(1 + sourceRoot
                    .toString().length());
            String outputFileName = destRootString + dirID + "/"+fileName;
            System.out.println("Editing color: " + fileName + " | writing to: " + outputFileName);
            editImageColor(sourceRootString+dirID+"/"+fileName, outputFileName);


        }
    }

    private static void editImageColor(String inputFileName, String outputFileName)
    {
        // For storing image in RAM
        BufferedImage image = null;

        // READ IMAGE
        try {
            File input_file = new File(
                    inputFileName);

            // image file path create an object of
            // BufferedImage type and pass as parameter the
            // width,  height and image int
            // type. TYPE_INT_ARGB means that we are
            // representing the Alpha , Red, Green and Blue
            // component of the image pixel using 8 bit
            // integer value.

//            image = new BufferedImage(
//                    width, height, BufferedImage.TYPE_INT_ARGB);

            // Reading input file
            image = ImageIO.read(input_file);

            System.out.println("Reading complete.");
        }
        catch (IOException e) {
            System.out.println("Error: " + e);
        }

        int width = image.getWidth();
        int height = image.getHeight();

        int p = (255 << 24) | (255 << 16) | (255 << 8) | 255;

        Pixel curr;
        int upperCutOff = 220;
        int lowerCutOff = 45;
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                curr = new Pixel(image.getRGB(i, j));
                if ((curr.r < upperCutOff || curr.g < upperCutOff || curr.b < upperCutOff)
                        && (curr.r > lowerCutOff || curr.g > lowerCutOff || curr.b > lowerCutOff))
                {
                    image.setRGB(i, j, p);
                }
            }
        }

        // WRITE IMAGE
        try {
            // Output file path
            File output_file = new File(
                    outputFileName);

            // Writing to file taking type and path as
            ImageIO.write(image, "jpg", output_file);

            System.out.println("Writing complete.");
        }
        catch (IOException e) {
            System.out.println("Error: " + e);
        }
    }


    private static class Pixel {
        int r;
        int g;
        int b;

        private Pixel(int threeBytes) {
            this.r = (threeBytes >> 16) & 0xff;
            this.g = (threeBytes >> 8) & 0xff;
            this.b = (threeBytes) & 0xff;
        }
    }

    public static void main(String[] args)
    {
        ManipulateImage.editImageColor("/Users/dakotahkurtz/Documents/blueprints" +
                "/blueprintJPEG/Sutliff Hall/SH-1ST FL.jpg", "/Users/dakotahkurtz/Documents/blueprints/blueprintJPEG/Sutliff Hall/SH-1STedited.jpg");
    }
}



