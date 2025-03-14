package individual;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Objects;

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
    public static String imageType = "png";

    public static String home = "/Users/dakotahkurtz/Documents/";
    public static String primaryDirectory = home + "blueprints2/";
    public static String originalPDF = primaryDirectory+"sentMapsOriginal/";
    public static String strippedTextPDF = primaryDirectory+"strippedTextPDF/";
    public static String convertedToImage = primaryDirectory+"blueprint_"+imageType+"/";
    public static String colorsCleaned = primaryDirectory+"finished_";

    public static void main(String[] args) throws IOException, InterruptedException
    {
//        TextRemoval textRemoval = new TextRemoval(originalPDF, strippedTextPDF);
//        PDFtoImage pdFtoImage = new PDFtoImage(originalPDF,
//                convertedToImage);

        for (int i = 0; i <= 250; i+= 50) {
            for (int j = 10; j <= 100; j+= 10) {
                ManipulateImage manipulateImage =
                        new ManipulateImage(convertedToImage,
                                colorsCleaned+i+"_"+j+"_"+imageType+"/", i, j);
                System.out.println("Finished writing " + i + "_" + j);

            }
        }

//        ManipulateImage manipulateImage =
//                new ManipulateImage("/Users/dakotahkurtz/Documents/blueprints" +
//                        "/finished_png/", "/Users/dakotahkurtz/Documents/blueprints" +
//                        "/finishedChange_png/" );


    }


    public static Directory recursivelyFindFiles(String root) {
        File rootFile = new File(root);
        return searchDirectory(rootFile);
    }

    private static Directory searchDirectory(File rootFile)
    {
        ArrayList<String> files = new ArrayList<>();
        ArrayList<Directory> subD = new ArrayList<>();

        for (File f : Objects.requireNonNull(rootFile.listFiles())) {
            if (isNonsense(f.toString())) {
                continue;
            }
            if (f.isDirectory()) {
                subD.add(searchDirectory(f));
            } else {
                files.add(f.toString());
            }
        }

        return new Directory(rootFile.toString(), files, subD);
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

    public static boolean isNonsense(String s) {
        return s.substring(0, 4).contains(".DS");
    }

    public static class Directory {
        ArrayList<Directory> subDirectories;
        ArrayList<String> fileNames;
        String rootAddress;

        public Directory(String rootAddress, ArrayList<String> fileNames,
                         ArrayList<Directory> subDirectories) {
            this.fileNames = fileNames;
            this.rootAddress = rootAddress;
            this.subDirectories = subDirectories;
        }
    }
}
