// from http://cs.au.dk/~amoeller/WWW/javaweb/server.html
import java.net.*;
import java.io.*;
import java.util.*;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO; 

public class FileServer {

    ServerSocket socket;
    int port;
    String home;
    static final int THUMB_W = 800;
    static final int THUMB_H = 600;

    public static void main(String[] args) {

        // read arguments
        if (args.length!=2) {
            System.out.println("Usage: java FileServer <port> <wwwhome>");
            System.exit(-1);
        }
        int portnum = Integer.parseInt(args[0]);
        String home = args[1];
        FileServer server = new FileServer(portnum);

        try {
            server.run(home);
        } catch (Exception e) {
            System.err.println("Error: " + e);
	    System.exit(-1);
        }
    }

    public FileServer(int portnum) {

        port = portnum;
    }

    public void scaleImage(File imageFile, String header, String contentType, 
                           OutputStream outstream, PrintStream pout) throws IOException {

        BufferedImage sourceImage = ImageIO.read( imageFile );
        int targetWidth = sourceImage.getWidth();
        int targetHeight = sourceImage.getHeight();

        if (targetWidth > THUMB_W) {
            targetHeight = (int)(targetHeight * THUMB_W / targetWidth);
            targetWidth = THUMB_W;
        }

        if (targetHeight > THUMB_H) {
            targetWidth = (int)(targetWidth * THUMB_H / targetHeight);
            targetHeight = THUMB_H;
        }

        BufferedImage scaledImage = new BufferedImage( targetWidth,
                targetHeight, BufferedImage.TYPE_INT_RGB );
        Graphics2D g2d = scaledImage.createGraphics();
        g2d.setRenderingHint( RenderingHints.KEY_INTERPOLATION,
                              RenderingHints.VALUE_INTERPOLATION_BILINEAR );
        g2d.drawImage( sourceImage, 0, 0, targetWidth, targetHeight, null );

        pout.print(header);
        ImageIO.write( scaledImage, contentType.substring(6, contentType.length()),
                outstream);
    }

    synchronized public void setHome(String h) {

        home = h;
    }

    synchronized public String getHome() {

        return home;
    }


    public void run(String h) throws IOException  {

        home = h;

        // open server socket
        if(socket != null) {
            socket.close();
        }
        socket = null;
        socket = new ServerSocket(port, 0, InetAddress.getByName("127.0.0.1")); 
        System.out.println("FileServer accepting connections on port " + port);

        // request handler loop
        while (true) {
            Socket connection = null;
            Boolean thumb = false;

            try {
                // wait for request
                connection = socket.accept();
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                OutputStream out = new BufferedOutputStream(connection.getOutputStream());
                PrintStream pout = new PrintStream(out);

                // read first line of request (ignore the rest)
                String request = in.readLine();
                if (request==null)
                    continue;
                log(connection, request);
                while (true) {
                    String misc = in.readLine();
                    if (misc==null || misc.length()==0) {
                        break;
                    }
                }

                // parse the line
                if (!request.startsWith("GET") || request.length()<14 ||
                        !(request.endsWith("HTTP/1.0") || request.endsWith("HTTP/1.1"))) {
                    // bad request
                    errorReport(pout, connection, "400", "Bad Request", 
                            "Your browser sent a request that " + 
                            "this server could not understand.");
                } else {
                    String req = request.substring(4, request.length()-9).trim();
                    if (req.indexOf("..")!=-1 || 
                            req.indexOf("/.ht")!=-1 || req.endsWith("~")) {
                        // evil hacker trying to read non-wwwhome or secret file
                        errorReport(pout, connection, "403", "Forbidden",
                                "You don't have permission to access the requested URL.");
                    } else {
                        String path = home + "/" + req;
                        if (path.endsWith(".thumb")) {
                            path = path.substring(0, path.length() - 6);
                            thumb = true;
                        }
                        File f = new File(path);
                        if(!f.exists()) {
                            // file not found
                            errorReport(pout, connection, "404", "Not Found",
                                    "The requested URL was not found on this server.");
                        } else if (f.isDirectory()) {
                            // redirect browser if referring to directory without final '/'
                            pout.print("HTTP/1.0 301 Moved Permanently\r\n" +
                                    "Location: http://" + 
                                    connection.getLocalAddress().getHostAddress() + ":" +
                                    connection.getLocalPort() + "/" + req + "/\r\n\r\n");
                            log(connection, "301 Moved Permanently");
                        } else {
                            try {
                                // send file
                                String contentType = guessContentType(path);
                                String header = "HTTP/1.0 200 OK\r\n" +
                                        "Content-Type: " + guessContentType(path) + "\r\n" +
                                        "Date: " + new Date() + "\r\n" +
                                        "Access-Control-Allow-Origin: * \r\n" +
                                        "Server: FileServer 1.0\r\n\r\n";

                                if (thumb && contentType.substring(0, 6).equals("image/")) { 
                                    scaleImage(f, header, contentType, out, pout);
                                } else {
                                    InputStream file = new FileInputStream(f);
                                    pout.print(header);
                                    sendFile(file, out); // send raw file 
                                }
                                log(connection, "200 OK");
                            } catch (IOException e) { 
                                // file not found
                                errorReport(pout, connection, "404", "Not Found",
                                        "The requested URL was not found on this server.");
                            }
                        }
                    }
                }
                out.flush();
            } catch (IOException e) { 
                System.err.println(e); 
            }
            try {
                if (connection != null) connection.close(); 
            } catch (IOException e) { System.err.println(e); }
        }
    }

    private static void log(Socket connection, String msg) {

        System.err.println(new Date() + " [" + connection.getInetAddress().getHostAddress() +
                ":" + connection.getPort() + "] " + msg);
    }

    private static void errorReport(PrintStream pout, Socket connection,
            String code, String title, String msg) {

        pout.print("HTTP/1.0 " + code + " " + title + "\r\n" +
                   "Access-Control-Allow-Origin: * \r\n\r\n" +
                   msg + "\r\n");

        log(connection, code + " " + title);
    }

    private static String guessContentType(String path)  {

        path = path.toLowerCase();

        if (path.endsWith(".html") || path.endsWith(".htm"))
            return "text/html";
        else if (path.endsWith(".txt") || path.endsWith(".java"))
            return "text/plain";
        else if (path.endsWith(".gif"))
            return "image/gif";
        else if (path.endsWith(".bmp"))
            return "image/bmp";
        else if (path.endsWith(".png"))
            return "image/png";
        else if (path.endsWith(".jpg") || path.endsWith(".jpeg"))
            return "image/jpeg";
        else if (path.endsWith(".pdf"))
            return "application/pdf";
        else if (path.endsWith(".doc"))
            return "application/msword";
        else if (path.endsWith(".xls"))
            return "application/vnd.ms-excel";
        else if (path.endsWith(".ppt"))
            return "application/vnd.ms-powerpoint";
        else
            return "application/octet-stream";
    }

    private static void sendFile(InputStream file, OutputStream out) {

        try {
            byte[] buffer = new byte[1000];
            while (file.available()>0) {
                out.write(buffer, 0, file.read(buffer));
            }
        } catch (IOException e) { System.err.println(e); }
    }
}
