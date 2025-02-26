import java.io.File;
import java.io.IOException;

/**
 * Program to combine all blueprint processing in sequence.
 * Can be run just once on a folder, variable originalPDF below, that contains the
 * subdirectories of each building. Does not work recursively - only goes two levels
 * deep. ie starting processing on the folder sentMapsOriginal will process all
 * blueprints in sentMapsOriginal/Ben Franklin and sentMapsOriginal/Hartline and so on.
 *
 * Code is pretty messy - just really meant to get the job done.
 *
 * PDFtoImage and PDFtoText class requires PDFBox version 3.x downloaded on your
 * computer
 * TextRemoval class requires GhostScript
 *
 * @author Dakotah Kurtz
 */

public class Processing
{
    public static String home = "/Users/dakotahkurtz/Documents/";
    public static String primaryDirectory = home + "blueprints/";
    public static String originalPDF = primaryDirectory+"sentMapsOriginal/";
    public static String strippedTextPDF = primaryDirectory+"strippedTextPDF/";
    public static String convertedToJpeg = primaryDirectory+"blueprintJPEG/";
    public static String colorsCleaned = primaryDirectory+"finishedJPEG/";

    public static void main(String[] args) throws IOException, InterruptedException
    {
        TextRemoval textRemoval = new TextRemoval(originalPDF, strippedTextPDF);
        PDFtoImage pdFtoImage = new PDFtoImage(textRemoval.getDestRootString(),
                convertedToJpeg);
        ManipulateImage manipulateImage =
                new ManipulateImage(pdFtoImage.getDestRootString(), colorsCleaned);
    }

    public static void emptyAndDeleteDir(File directory){
        if (!directory.exists()) {
            return;
        }
        if (directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    emptyAndDeleteDir(file); // Recursive call
                }
            }
        }
        directory.delete();
    }

}
