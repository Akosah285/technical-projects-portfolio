import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

import javax.swing.*;

/**
 * Webcam-based drawing 
 * Scaffold for PS-1, Dartmouth CS 10, Fall 2016
 * 
 * @author Chris Bailey-Kellogg, Spring 2015 (based on a different webcam app from previous terms)
 * @authors Sylvester Elorm Coch and Akwasi Akosah, Modified for submission
 */
public class CamPaint extends Webcam {
	
	private char displayMode = 'w';			// what to display: 'w': live webcam, 'r': recolored image, 'p': painting
	private RegionFinder finder;			// handles the finding
	private Color targetColor;          	// color of regions of interest (set by mouse press)
	private Color paintColor = Color.blue;	// the color to put into the painting from the "brush"
	private BufferedImage painting;			// the resulting masterpiece
	private BufferedImage recoloredImage;   // recolored image to draw
	
	/**
	 * Initializes the region finder and the drawing
	 */
	public CamPaint() {
		finder = new RegionFinder();
		clearPainting();
	}

	/**
	 * Resets the painting to a blank image
	 */
	protected void clearPainting() {
		painting = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
	}

	/**
	 * DrawingGUI method, here drawing one of live webcam, recolored image, or painting, 
	 * depending on display variable ('w', 'r', or 'p')
	 */
	@Override
	public void draw(Graphics g) {
		// TODO: YOUR CODE HERE
		if (displayMode =='w') {
			g.drawImage(image,0,0,null);   // display webcam image
		}
		
		if (displayMode == 'p') {
			g.drawImage(painting,0,0,null); //display painting
		}
		
		if (displayMode == 'r') {
			g.drawImage(recoloredImage,0,0,null); // display webcam image with recolored pixels
		}
		
		
	}

	/**
	 * Webcam method, here finding regions and updating the painting.
	 */
	@Override
	public void processImage() {
		
		if (image != null && targetColor != null) {
			
			finder = new RegionFinder(image);
			finder.setImage(image);
			finder.findRegions(targetColor);
			finder.recolorImage();
			recoloredImage = finder.getRecoloredImage();
			ArrayList<Point> paintbrush = finder.largestRegion();
			
			for (Point point : paintbrush) {
				painting.setRGB(point.x, point.y, paintColor.getRGB());
								
			}
		}
		
	}

	/**
	 * Overrides the DrawingGUI method to set the track color.
	 * Gets mouse position and set pixel color as the target color
	 */
	@Override
	public void handleMousePress(int x, int y) {
		
		if ((0 <= x) && (x <=  image.getWidth() - 1) &&  (0 <=y ) && (y <= image.getHeight() -1)) {
			targetColor = new Color(image.getRGB(x,y));
		}
		
	}

	/**
	 * DrawingGUI method, here doing various drawing commands
	 */
	@Override
	public void handleKeyPress(char k) {
		if (k == 'p' || k == 'r' || k == 'w') { // display: painting, recolored image, or webcam
			displayMode = k;
		}
		else if (k == 'c') { // clear
			clearPainting();
		}
		else if (k == 'o') { // save the recolored image
			saveImage(finder.getRecoloredImage(), "pictures/recolored.png", "png");
		}
		else if (k == 's') { // save the painting
			saveImage(painting, "pictures/painting.png", "png");
		}
		else {
			System.out.println("unexpected key "+k);
		}
	}

	public static void main(String[] args) {
		SwingUtilities.invokeLater(new Runnable() {
			public void run() {
				new CamPaint();
			}
		});
	}
}
