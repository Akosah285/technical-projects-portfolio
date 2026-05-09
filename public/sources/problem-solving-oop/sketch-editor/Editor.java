
/**
* Modified by Sylvester E Coch and Akwasi Akosah for submission in CS 10
 * Winter 2019
 * Prof. Timothy J Peirson
 */
import java.util.ArrayList;
import java.util.List;
import java.awt.*;
import java.awt.event.*;

import javax.swing.*;



/**
 * Client-server graphical editor
 * 
 * @author Chris Bailey-Kellogg, Dartmouth CS 10, Fall 2012; loosely based on CS 5 code by Tom Cormen
 * @author CBK, winter 2014, overall structure substantially revised
 * @author Travis Peters, Dartmouth CS 10, Winter 2015; remove EditorCommunicatorStandalone (use echo server for testing)
 * @author CBK, spring 2016 and Fall 2016, restructured Shape and some of the GUI
 */

public class Editor extends JFrame 
{	
	private static String serverIP = "localhost";			// IP address of sketch server
	// "localhost" for your own machine;
	// or ask a friend for their IP address

	private static final int width = 800, height = 800;		// canvas size

	// Current settings on GUI
	public enum Mode {
		DRAW, MOVE, RECOLOR, DELETE
	}
	private Mode mode = Mode.DRAW;				// drawing/moving/recoloring/deleting objects
	private String shapeType = "ellipse";		// type of object to add
	private Color color = Color.black;			// current drawing color

	// Drawing state
	// these are remnants of my implementation; take them as possible suggestions or ignore them
	private Shape curr = null;					// current shape (if any) being drawn
	private Sketch sketch;						// holds and handles all the completed objects
	private int movingId = -1;					// current shape id (if any; else -1) being moved
	private Point drawFrom = null;				// where the drawing started
	private Point moveFrom = null;				// where object is as it's being dragged

    // Other state
    // TODO: YOUR CODE HERE
	
	private int topIndex; // We need to hold the top object's points for actions.
	
	// Communication
	private EditorCommunicator comm;			// communication with the sketch server

	public Editor() 
	{
		super("Graphical Editor");

		sketch = new Sketch();

		// Connect to server
		comm = new EditorCommunicator(serverIP, this);
		comm.start();

		// Helpers to create the canvas and GUI (buttons, etc.)
		JComponent canvas = setupCanvas();
		JComponent gui = setupGUI();

		// Put the buttons and canvas together into the window
		Container cp = getContentPane();
		cp.setLayout(new BorderLayout());
		cp.add(canvas, BorderLayout.CENTER);
		cp.add(gui, BorderLayout.NORTH);

		// Usual initialization
		setLocationRelativeTo(null);
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		pack();
		setVisible(true);
	}

	/**
	 * Creates a component to draw into
	 */
	private JComponent setupCanvas() {
		JComponent canvas = new JComponent() {
			public void paintComponent(Graphics g) {
				super.paintComponent(g);
				drawSketch(g);
			}
		};
		
		canvas.setPreferredSize(new Dimension(width, height));

		canvas.addMouseListener(new MouseAdapter() {
			public void mousePressed(MouseEvent event) {
				handlePress(event.getPoint());
			}

			public void mouseReleased(MouseEvent event) {
				handleRelease();
			}
		});		

		canvas.addMouseMotionListener(new MouseAdapter() {
			public void mouseDragged(MouseEvent event) {
				handleDrag(event.getPoint());
			}
		});
		
		return canvas;
	}

	/**
	 * Creates a panel with all the buttons
	 */
	private JComponent setupGUI() {
		// Select type of shape
		String[] shapes = {"ellipse", "freehand", "rectangle", "segment"};
		JComboBox<String> shapeB = new JComboBox<String>(shapes);
		shapeB.addActionListener(e -> shapeType = (String)((JComboBox<String>)e.getSource()).getSelectedItem());

		// Select drawing/recoloring color
		// Following Oracle example
		JButton chooseColorB = new JButton("choose color");
		JColorChooser colorChooser = new JColorChooser();
		JLabel colorL = new JLabel();
		colorL.setBackground(Color.black);
		colorL.setOpaque(true);
		colorL.setBorder(BorderFactory.createLineBorder(Color.black));
		colorL.setPreferredSize(new Dimension(25, 25));
		JDialog colorDialog = JColorChooser.createDialog(chooseColorB,
				"Pick a Color",
				true,  //modal
				colorChooser,
				e -> { color = colorChooser.getColor(); colorL.setBackground(color); },  // OK button
				null); // no CANCEL button handler
		chooseColorB.addActionListener(e -> colorDialog.setVisible(true));

		// Mode: draw, move, recolor, or delete
		JRadioButton drawB = new JRadioButton("draw");
		drawB.addActionListener(e -> mode = Mode.DRAW);
		drawB.setSelected(true);
		JRadioButton moveB = new JRadioButton("move");
		moveB.addActionListener(e -> mode = Mode.MOVE);
		JRadioButton recolorB = new JRadioButton("recolor");
		recolorB.addActionListener(e -> mode = Mode.RECOLOR);
		JRadioButton deleteB = new JRadioButton("delete");
		deleteB.addActionListener(e -> mode = Mode.DELETE);
		ButtonGroup modes = new ButtonGroup(); // make them act as radios -- only one selected
		modes.add(drawB);
		modes.add(moveB);
		modes.add(recolorB);
		modes.add(deleteB);
		JPanel modesP = new JPanel(new GridLayout(1, 0)); // group them on the GUI
		modesP.add(drawB);
		modesP.add(moveB);
		modesP.add(recolorB);
		modesP.add(deleteB);

		// Put all the stuff into a panel
		JComponent gui = new JPanel();
		gui.setLayout(new FlowLayout());
		gui.add(shapeB);
		gui.add(chooseColorB);
		gui.add(colorL);
		gui.add(modesP);
		return gui;
	}

	/**
	 * Getter for the sketch instance variable
	 */
	public Sketch getSketch() {
		return sketch;
	}

	/**
	 * Draws all the shapes in the sketch,
	 * along with the object currently being drawn in this editor (not yet part of the sketch)
	 */
	public void drawSketch(Graphics g) 
	{
		// TODO: YOUR CODE HERE
		sketch.draw(g);  // make sketch draw themselves
		if (curr != null)
		curr.draw(g); //make current object draw itself too
		
	}

	// Helpers for event handlers
	
	/**
	 * Helper method for press at point
	 * In drawing mode, start a new object;
	 * in moving mode, (request to) start dragging if clicked in a shape;
	 * in recoloring mode, (request to) change clicked shape's color
	 * in deleting mode, (request to) delete clicked shape
	 */
	private void handlePress(Point p){
		// TODO: YOUR CODE HERE	
		
		if(mode == Mode.DRAW){
			// shape to draw is ellipse, and adjust drawFrom variable
			if(shapeType.equals("ellipse"))
			{
				curr = new Ellipse((int)(p.getX()), (int)(p.getY()), color);
				drawFrom = p;
			}
		
			
			// shape to draw is rectangle, and adjust drawFrom variable
			else if(shapeType.equals("rectangle")){
				curr = new Rectangle((int)(p.getX()), (int)(p.getY()), color);
				drawFrom = p;
			}
			
			// shape to draw is segment, and adjust drawFrom variable
			else if(shapeType.equals("segment")){
				curr = new Segment((int)(p.getX()), (int)(p.getY()), color);
				drawFrom = p;
			}
		}
		
		// We need to get the top object
		else if(mode == Mode.MOVE){
			topIndex = sketch.topMost((int)(p.getX()), (int)(p.getY()));
			if(topIndex >= 0) moveFrom = p;
		}
		
		// We are requesting to recolor the object.
		else if(mode == Mode.RECOLOR){
			topIndex = sketch.topMost((int)(p.getX()), (int)(p.getY()));
			if(topIndex >= 0) comm.recolor(topIndex, color);
		}
		
		// We are requesting to delete it.
		else if(mode == Mode.DELETE){
			topIndex = sketch.topMost((int)(p.getX()), (int)(p.getY()));
			if(topIndex >= 0) comm.delete(topIndex);
		}
		
		
		// redraw after the change
		repaint();
	}

	/**
	 * Helper method for drag to new point
	 * In drawing mode, update the other corner of the object;
	 * in moving mode, (request to) drag the object
	 */
	private void handleDrag(Point p) {
		// TODO: YOUR CODE HERE
		
		// If we are in the drawing mode and the current shape exists
		// we have added this method to shape interface , so that this exists for all possible shapes
		if(mode == Mode.DRAW && curr != null){
			curr.setCorners((int)(drawFrom.getX()), (int)(drawFrom.getY()), (int)(p.getX()), (int)(p.getY()));
		}
		
		else if(mode == Mode.MOVE && topIndex >= 0){
			comm.move(topIndex, (int)(p.getX() - moveFrom.getX()), (int)(p.getY() - moveFrom.getY()));// send message to server
			moveFrom = p;
		}
		
		repaint();
		
	}

	/**
	 * Helper method for release
	 * In drawing mode, pass the add new object request on to the server;
	 * in moving mode, release it		
	 */
	private void handleRelease() {
		// TODO: YOUR CODE HERE

		if (mode == Mode.DRAW) {
			if (curr != null) {
				comm.add(curr); //request to add the new shape to the sketch
				curr = null;
			}
		} 
		
		else if (mode == Mode.MOVE) {
			drawFrom = moveFrom;
			moveFrom = null; 
			topIndex = -1;  // no one currently being moved
		}
		
		repaint();
	}

	public static void main(String[] args) {
		SwingUtilities.invokeLater(new Runnable() {
			public void run() {
				new Editor();
			}
		});	
	}
}
