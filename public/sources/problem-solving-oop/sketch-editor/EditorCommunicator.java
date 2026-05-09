

import java.awt.Color;
import java.io.*;
import java.net.Socket;

/**
 * Handles communication to/from the server for the editor
 * 
 * @author Chris Bailey-Kellogg, Dartmouth CS 10, Fall 2012
 * @author Chris Bailey-Kellogg; overall structure substantially revised Winter 2014
 * @author Travis Peters, Dartmouth CS 10, Winter 2015; remove EditorCommunicatorStandalone (use echo server for testing)
 */
public class EditorCommunicator extends Thread {
	private PrintWriter out;		// to server
	private BufferedReader in;		// from server
	protected Editor editor;		// handling communication for

	/**
	 * Establishes connection and in/out pair
	 */
	public EditorCommunicator(String serverIP, Editor editor) {
		this.editor = editor;
		System.out.println("connecting to " + serverIP + "...");
		try {
			Socket sock = new Socket(serverIP, 4242);
			out = new PrintWriter(sock.getOutputStream(), true);
			in = new BufferedReader(new InputStreamReader(sock.getInputStream()));
			System.out.println("...connected");
		}
		catch (IOException e) {
			System.err.println("couldn't connect");
			System.exit(-1);
		}
	}

	/**
	 * Sends message to the server
	 */
	public void send(String msg) {
		out.println(msg);
	}

	/**
	 * Keeps listening for and handling (your code) messages from the server
	 */
	public void run() 
	{
		try {
			// Handle messages
			// TODO: YOUR CODE HERE
			String serverMessage;
			
			//keep listening and handling messages from server
			while ((serverMessage = in.readLine())!= null) {
				String[] m = serverMessage.split(" "); // tokenise message for processing
				String command = m[0];
				
				if(command.equals("draw")) {
					if(m[1].equals("ellipse")) {
						Color col = new Color(Integer.parseInt(m[m.length - 1]));
						Ellipse e = new Ellipse(Integer.parseInt(m[2]), Integer.parseInt(m[3]),
								Integer.parseInt(m[4]), Integer.parseInt(m[5]), col);
						editor.getSketch().add(e);
					}
					else if(m[1].equals("rectangle")) {
						Color c = new Color(Integer.parseInt(m[m.length - 1]));
						Rectangle rec = new Rectangle(Integer.parseInt(m[2]), Integer.parseInt(m[3]),
								Integer.parseInt(m[4]), Integer.parseInt(m[5]), c);
						editor.getSketch().add(rec);
					}
					else if(m[1].equals("segment")) {
						Color cl = new Color(Integer.parseInt(m[m.length - 1]));
						Segment seg = new Segment(Integer.parseInt(m[2]), Integer.parseInt(m[3]),
								Integer.parseInt(m[4]), Integer.parseInt(m[5]), cl);
						editor.getSketch().add(seg);
					}
				}
				else if(command.equals("move")) {
					Shape shape=editor.getSketch().retrieve(Integer.parseInt(m[1]));
					shape.moveBy(Integer.parseInt(m[2]), Integer.parseInt(m[3]));
				}
				else if(command.equals("recolor")) {
					Color col =new Color(Integer.parseInt(m[2]));
					editor.getSketch().retrieve(Integer.parseInt(m[1])).setColor(col);
				}
				else if(command.equals("delete")) {
					editor.getSketch().delete(Integer.parseInt(m[1]));
				}
				editor.repaint();
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			System.out.println("server hung up");
		}
	}

	// Send editor requests to the server
	// TODO: YOUR CODE HERE

	//request messages from editor to server
	public synchronized void add(Shape shape) { 
		send("draw " + shape.toString());
	}

	public void recolor(int index, Color color) {
		send("recolor " + index + " " + color.getRGB());
	
	}

	public void move(int index, int dx, int dy) {
		send("move " + index + " " + dx + " " + dy);
	}

	public void delete(int index) {
		send("delete " + index);	
	}
	
	
}
