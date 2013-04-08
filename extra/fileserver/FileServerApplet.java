import javax.swing.*;
import java.awt.event.*;
import java.awt.*;
import java.util.*;
import java.io.File;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.FileNotFoundException;

public class FileServerApplet extends JApplet implements ActionListener {

    JFileChooser chooser;
    JLabel dirname, state;
    JButton go;
    FileServer server;
    int port = 5990;

    public static final String CONFIG_FILE_NAME = ".dm-fileserver.conf";

    public void init() {

        try {
            SwingUtilities.invokeAndWait(new Runnable() {
                public void run() {
                    createGUI();
                    // start server with default directory, if it exists
                    String defaultDir = readConfig();
                    if (defaultDir != null) {
                        startServer(defaultDir);
                    }
                }
            });
        } catch (Exception e) {
            System.err.println("createGUI didn't complete successfully");
        }
    }

    /**
     * Try to find and read config file located at %HOMEDIR%/CONFIG_FILE_NAME,
     * to obtain the user's preferred default path for the file server
     */
    public String readConfig() {

        String defaultPath = null;

        // search for config file
        String configFilePath = System.getProperty("user.home") + "/" + CONFIG_FILE_NAME;
        File f = new File(configFilePath);
        if (f.exists() && f.canRead() && f.isFile()) {
            try {
                BufferedReader br = new BufferedReader(new FileReader(f));
                try {
                String line = br.readLine();
                    if (line != null && !line.equals("")) {
                        // check if path is a directory
                        File d = new File(line);
                        if (d.exists() && d.canRead() && d.isDirectory()) {
                            defaultPath = line;
                        }
                    }
                } catch(IOException e) {
                    System.err.println("Config file could not be read");
                }
                try {
                    br.close();
                } catch(IOException e) {
                    e.printStackTrace();
                }
            } catch(FileNotFoundException e) {
                System.err.println("Config file could not be found at " + configFilePath);
            }
        }
        
        return defaultPath;
    }

    /**
     * Try to find - or create - and write config file at %HOMEDIR%/CONFIG_FILE_NAME
     */
    public void writeConfig(String path) {

        String defaultPath = null;

        // search for config file
        String configFilePath = System.getProperty("user.home") + "/" + CONFIG_FILE_NAME;
        File f = new File(configFilePath);

        if (! f.exists()) {
            try {
                f.createNewFile();
            } catch(IOException e) {
                System.err.println("Could not create config file");
            }
        }

        if (f.canWrite() && f.isFile()) {
            try {
                FileWriter fw = new FileWriter(f.getAbsoluteFile());
                BufferedWriter bw = new BufferedWriter(fw);
                bw.write(path);
                bw.close();
            } catch(IOException e) {
                System.err.println("Config file could not be written");
            }
        } else {
            System.err.println("File exists but cannot be written, or is a directory");
        }
    }

    public void createGUI() {

        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.PAGE_AXIS));

        state = new JLabel("");
        panel.add(state);

        dirname = new JLabel("Select a directory");
        panel.add(dirname);

        go = new JButton("Choose Directory");
        go.addActionListener(this);
        panel.add(go);

        add(panel);
    }

    public void actionPerformed(ActionEvent e) {

        int result;

        chooser = new JFileChooser(); 
        chooser.setCurrentDirectory(new java.io.File("."));
        chooser.setDialogTitle("Choose directory");
        chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        chooser.setAcceptAllFileFilterUsed(false);

        if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) { 
            String dir = chooser.getSelectedFile().toString();
            startServer(dir);
            // save config
            writeConfig(dir);
            //dirname.setText(chooser.getCurrentDirectory().toString());
        } else {
            System.out.println("No Selection ");
        }
    }

    public void startServer(final String dir) {

        //go.setEnabled(false);

        if(server == null) {
            server = new FileServer(port);

            SwingWorker worker = new SwingWorker<Integer, Void>() {
                @Override
                public Integer doInBackground() {
                    try {
                        dirname.setText("Directory : " + dir);
                        state.setText("Local file Server is running");
                        server.run(dir);
                        return 0;

                    } catch (Exception e) {
                        state.setText("Error cannot start server: \n" + e);
                        return 1;
                    }
                }
            };
            worker.execute();

        } else {
            server.setHome(dir);
            dirname.setText("Directory : " + dir);
        }

        // SwingUtilities.invokeLater(new Runnable() {
        //         public void run() {
        //         }
        // });
    }
}
