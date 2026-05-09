
import java.awt.Color;
import java.io.*;
import java.net.Socket;

/**
 * Handles communication between the server and one client, for SketchServer
 *
 * @author Chris Bailey-Kellogg, Dartmouth CS 10, Fall 2012; revised Winter 2014 to separate SketchServerCommunicator
 */
public class SketchServerCommunicator extends Thread {
	private Socket sock;					// to talk with client
	private BufferedReader in;				// from client
	private PrintWriter out;				// to client
	private SketchServer server;			// handling communication for

	public SketchServerCommunicator(Socket sock, SketchServer server) {
		this.sock = sock;
		this.server = server;
	}

	/**
	 * Sends a message to the client
	 * @param msg
	 */
	public void send(String msg) {
		out.println(msg);
	}
	
	/**
	 * Keeps listening for and handling (your code) messages from the client
	 */
	public void run() {
		try {
			System.out.println("someone connected");
			
			// Communication channel
			in = new BufferedReader(new InputStreamReader(sock.getInputStream()));
			out = new PrintWriter(sock.getOutputStream(), true);

			// Tell the client the current state of the world
			// TODO: YOUR CODE HERE
			
			for (int i=0; i < server.getSketch().size(); i++) {
				send("draw " + server.getSketch().retrieve(i).toString());
			}

			// Keep getting and handling messages from the client
			// TODO: YOUR CODE HERE
			
			String clientMessage;
			
			// the same listening mechanism as the editor, except we access the server
			while ((clientMessage = in.readLine()) != null) { 
				// copy of the sketch instead of the editor copy
				String[] msg = clientMessage.split(" "); // tokenise received message
				String request = msg[0]; // inteprete 1st word as the request
				
				// if request is to draw, create and add to master sketch
				if(request.equals("draw")) {
					if(msg[1].equals("ellipse")) {
						Color col = new Color(Integer.parseInt(msg[msg.length - 1]));
						Ellipse e = new Ellipse(Integer.parseInt(msg[2]), Integer.parseInt(msg[3]),
								Integer.parseInt(msg[4]), Integer.parseInt(msg[5]), col);
						server.getSketch().add(e);
					}
					else if(msg[1].equals("rectangle")) {
						Color color = new Color(Integer.parseInt(msg[msg.length - 1]));
						Rectangle rec = new Rectangle(Integer.parseInt(msg[2]), Integer.parseInt(msg[3]),
								Integer.parseInt(msg[4]), Integer.parseInt(msg[5]), color);
						server.getSketch().add(rec);
					}
					else if(msg[1].equals("segment")) {
						Color color = new Color(Integer.parseInt(msg[msg.length - 1]));
						Segment seg = new Segment(Integer.parseInt(msg[2]), Integer.parseInt(msg[3]),
								Integer.parseInt(msg[4]), Integer.parseInt(msg[5]), color);
						server.getSketch().add(seg);
					}
				}
				//grant access to move
				else if(request.equals("move")) {
					Shape shape = server.getSketch().retrieve(Integer.parseInt(msg[1]));
					shape.moveBy(Integer.parseInt(msg[2]), Integer.parseInt(msg[3]));
				}
				
				// grant access to recolor
				else if(request.equals("recolor")) {
					Color col = new Color(Integer.parseInt(msg[2]));
					server.getSketch().retrieve(Integer.parseInt(msg[1])).setColor(col);
				}
				// grant access to delete
				else if(request.equals("delete")) {
					server.getSketch().delete(Integer.parseInt(msg[1]));
				}
				
				// update all editors on current state of the sketch
				server.broadcast(clientMessage);
			}


			// Clean up -- note that also remove self from server's list so it doesn't broadcast here
			server.removeCommunicator(this);
			out.close();
			in.close();
			sock.close();
		}
		catch (IOException e) {
			e.printStackTrace();
		}
	}
}
