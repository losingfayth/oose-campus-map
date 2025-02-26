
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TextRemoval
{
    private static String gsLocation = "/usr/local/bin/gs";
    private  String sourceRootString;
    private  String destRootString;

    public TextRemoval(String sourceRoot, String destRootString) throws IOException, InterruptedException
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
            System.out.println("Removing text from " + fileName + " | writing to: " + outputFileName);

            List<String> commands = new ArrayList<>();
            String[] arguments = new String[]{gsLocation, "-o",outputFileName
                    ,
                    "-sDEVICE" +
                            "=pdfwrite",
                    "-dFILTERTEXT", fileName};
            commands.addAll(Arrays.asList(arguments));

            ProcessBuilder pb = new ProcessBuilder(commands);
            pb.directory(sourceRoot);
            pb.redirectErrorStream(true);
            Process process = pb.start();


            //Read output
            StringBuilder out = new StringBuilder();
            BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = null, previous = null;
            while ((line = br.readLine()) != null)
            {
                if (!line.equals(previous))
                {
                    previous = line;
                    out.append(line).append('\n');
                }
            }

            //Check result
            if (process.waitFor() == 0) {
                System.out.println("Success!");
            } else {
                //Abnormal termination: Log command parameters and output and throw ExecutionException
                System.err.println(commands);
                System.err.println(out.toString());
                System.exit(1);
            }


        }
    }


}


