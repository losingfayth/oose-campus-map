import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PDFtoText
{
    private static String progLocation = "/usr/bin/java";
    private static String pdfBoxLocation = "/Users/dakotahkurtz/Downloads/pdfbox-app-3.0.4.jar";
    private  String sourceRootString;
    private  String destRootString;

    public PDFtoText(String sourceRoot, String destRootString) throws IOException,
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
                    .toString().length(), f.toString().length()-4);
            String outputFileName = destRootString + dirID + "/"+fileName;

            //java -jar pdfbox-app-3.y.z.jar render [OPTIONS] -i=<infile>
            String[] arguments = new String[]{progLocation, "-jar", pdfBoxLocation,
                    "export:text","-i="+fileName+".pdf"};
            List<String> commands = new ArrayList<>(Arrays.asList(arguments));

            ProcessBuilder pb = new ProcessBuilder(commands);
            pb.directory(sourceRoot);
            pb.redirectErrorStream(true);
            Process process = pb.start();


            //Read output
            StringBuilder out = new StringBuilder();
            BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = null, previous = null;
            while ((line = br.readLine()) != null)
                if (!line.equals(previous)) {
                    previous = line;
                    out.append(line).append('\n');
                    System.out.println(line);
                }

            //Check result
            if (process.waitFor() == 0) {
                System.out.println("Success!");
                String srcString = sourceRootString+dirID+"/"+fileName+".txt";
                Files.move(Paths.get(srcString), Paths.get(outputFileName+".txt"),
                        StandardCopyOption.REPLACE_EXISTING);
                System.out.printf("Moving %s from %s %nto%n%s%n", fileName, srcString,
                        outputFileName);
            } else {
                //Abnormal termination: Log command parameters and output and throw ExecutionException
                System.err.println(commands);
                System.err.println(out.toString());
                System.exit(1);
            }


        }
    }

    public static void main(String[] args) throws IOException, InterruptedException
    {
        PDFtoText pdFtoText = new PDFtoText(Processing.originalPDF,
                Processing.primaryDirectory + "textOnly/");
    }


}
