package individual;// Java Program to list all files
// From a directory recursively
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.*;

public class ManipulateImage
{
    private  String sourceRootString;
    private  String destRootString;
    private  int BLACK_CUT_OFF = 30;
    private int validSegmentCutoff = 40;

    public ManipulateImage(String sourceRoot, String destRootString, int BLACK_CUT_OFF,
                           int validSegmentCutoff)
            throws IOException, InterruptedException
    {
        this.destRootString = destRootString;
        this.sourceRootString = sourceRoot;
        this.BLACK_CUT_OFF = BLACK_CUT_OFF;
        this.validSegmentCutoff = validSegmentCutoff;

        File dest = new File(destRootString);
        if (dest.exists()) {
            Processing.emptyAndDeleteDir(dest);
        }
        dest.mkdir();

        File root = new File(sourceRootString);
        File[] files = root.listFiles();

        assert files != null;
        for (File f : files) {
            if (!Processing.isNonsense(f.toString().substring(sourceRootString.length()))) {
                processBuilding(f, f.toString().substring(sourceRootString.length()));
            }

        }
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
            if (Processing.isNonsense(f.toString())) {
                continue;
            }
            String fileName = f.toString().substring(1 + sourceRoot
                    .toString().length());
            String outputFileName = destRootString + dirID + "/"+fileName;
            System.out.println("Editing color: " + fileName + " | writing to: " + outputFileName);
            editImageColor(sourceRootString+dirID+"/"+fileName, outputFileName);


        }



    }

    private  void editImageColor(String inputFileName, String outputFileName)
    {
        // For storing image in RAM
        BufferedImage image = null;

        // READ IMAGE
        try {
            File input_file = new File(
                    inputFileName);

            // Reading input file
            image = ImageIO.read(input_file);

            System.out.println("Reading complete.");
        }
        catch (IOException e) {
            System.out.println("Error: " + e);
        }


        assert image != null;
        ValidCheck validCheck = new ValidCheck(image, this.BLACK_CUT_OFF);

        int backGroundColor = (255<<24) | (255 << 16) | (242 <<8) | 217;
        int blackColor = (255 << 24) | (0);
        byte[][] visited = new byte[validCheck.width][validCheck.height];
        for (byte[] b : visited)
        {
            Arrays.fill(b, (byte) 0);
        }

        Pixel curr;
        ArrayList<int[]> toKeep;
        for (int i = 0; i < visited.length; i++) {
            for (int j = 0; j < visited[i].length; j++) {
                if (visited[i][j] != 0) {
                    continue;
                }
                curr = new Pixel(image.getRGB(i, j));
                if (Pixel.isBlack(image.getRGB(i, j), BLACK_CUT_OFF)) {
                    visited[i][j] = 1;

                    toKeep = new ArrayList<>(100);
                    toKeep.add(new int[]{i, j});

                    Queue<Object[]> q = new LinkedList<>();
                    q.add(new Object[]{i, j, 1});
                    int x, y;
                    int count;
                    while (!q.isEmpty()) {
                        Object[] arr = q.poll();
                        x = (int) arr[0];
                        y = (int) arr[1];
                        count = (int) arr[2];

                        if (validCheck.isValid(x+1, y) && visited[x+1][y] == 0) {
                            visited[x+1][y] = 1;
                            toKeep.add(new int[]{x+1,y});
                            q.add(new Object[]{x+1,y,++count});
                        }
                        if (validCheck.isValid(x-1,y) && visited[x-1][y]==0) {
                            visited[x-1][y] = 1;
                            toKeep.add(new int[]{x-1,y});
                            q.add(new Object[]{x-1,y,++count});
                        }
                        if (validCheck.isValid(x,y+1) && visited[x][y+1]==0) {
                            visited[x][y+1] = 1;
                            toKeep.add(new int[]{x,y+1});
                            q.add(new Object[]{x,y+1,++count});
                        }
                        if (validCheck.isValid(x,y-1) && visited[x][y-1]==0) {
                            visited[x][y-1] = 1;
                            toKeep.add(new int[]{x,y-1});
                            q.add(new Object[]{x,y-1,++count});
                        }
                        if (validCheck.isValid(x-1,y-1) && visited[x-1][y-1]==0) {
                            visited[x-1][y-1] = 1;
                            toKeep.add(new int[]{x-1,y-1});
                            q.add(new Object[]{x-1,y-1,++count});
                        }
                        if (validCheck.isValid(x-1,y+1) && visited[x-1][y]==0) {
                            visited[x-1][y+1] = 1;
                            toKeep.add(new int[]{x-1,y+1});
                            q.add(new Object[]{x-1,y+1,++count});
                        }
                        if (validCheck.isValid(x-1,y-1) && visited[x-1][y-1]==0) {
                            visited[x-1][y-1] = 1;
                            toKeep.add(new int[]{x-1,y-1});
                            q.add(new Object[]{x-1,y-1,++count});
                        }
                        if (validCheck.isValid(x-1,y+1) && visited[x-1][y+1]==0) {
                            visited[x-1][y+1] = 1;
                            toKeep.add(new int[]{x-1,y+1});
                            q.add(new Object[]{x-1,y+1,++count});
                        }
                    }

                    if (toKeep.size() < this.validSegmentCutoff) {
                        for (int[] arr : toKeep) {
                            visited[arr[0]][arr[1]] = 2;
                        }
                    }
                } else {
                    visited[i][j] = 2;
                }
            }
        }

        for (int i = 0; i < visited.length; i++) {
            for (int j = 0; j < visited[i].length; j++) {
                if (visited[i][j] == 1) {
                    image.setRGB(i, j, blackColor);
                } else {
                    image.setRGB(i, j, backGroundColor);
                }
            }
        }

        // WRITE IMAGE
        try {
            // Output file path
            File output_file = new File(
                    outputFileName);

            // Writing to file taking type and path as
            ImageIO.write(image, Processing.imageType, output_file);

            System.out.println("Writing complete.");
        }
        catch (IOException e) {
            System.out.println("Error: " + e);
        }



    }

//    private boolean inBounds(int i, int j, int w, int h) {
//        return  (i >= 0 && j >= 0 && i < w && j < h);
//    }



    private static class Pixel {
        int r;
        int g;
        int b;

        private Pixel(int threeBytes) {
            this.r = (threeBytes >> 16) & 0xff;
            this.g = (threeBytes >> 8) & 0xff;
            this.b = (threeBytes) & 0xff;
        }

        private static boolean isBlack(int threeBytes, int BLACK_CUT_OFF) {
            return ((threeBytes >> 16) & 0xff) < BLACK_CUT_OFF && (((threeBytes >> 8) & 0xff) < BLACK_CUT_OFF) && (((threeBytes) & 0xff) < BLACK_CUT_OFF);
        }

        private static boolean isShadeOfGray(int threeBytes) {
            return (((threeBytes >> 16) & 0xff) == ((threeBytes >> 8) & 0xff) && ((threeBytes >> 16) & 0xff) == ((threeBytes) & 0xff));
        }
    }

    static class ValidCheck {
        BufferedImage image;
        int width;
        int height;
        int BLACK_CUT_OFF;
        private ValidCheck(BufferedImage image, int BLACK_CUT_OFF) {
            this.image = image;
            this.width = image.getWidth();
            this.height = image.getHeight();
            this.BLACK_CUT_OFF = BLACK_CUT_OFF;
        }

        boolean isValid(int i, int j) {
            return  (i >= 0 && j >= 0 && i < width && j < height) && (Pixel.isBlack(image.getRGB(i, j), this.BLACK_CUT_OFF) || Pixel.isShadeOfGray(image.getRGB(i, j)));

        }
    }

    public static void main(String[] args)
    {
    }
}



