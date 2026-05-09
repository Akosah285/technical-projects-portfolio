import java.awt.*;
import java.awt.image.*;
import java.util.*;

/**
 * Region growing algorithm: finds and holds regions in an image.
 * Each region is a list of contiguous points with colors similar to a target color.
 * Scaffold for PS-1, Dartmouth CS 10, Fall 2016
 * 
 * @author Chris Bailey-Kellogg, Winter 2014 (based on a very different structure from Fall 2012)
 * @author Travis W. Peters, Dartmouth CS 10, Updated Winter 2015
 * @author CBK, Spring 2015, updated for CamPaint
 * 
 * @authors Sylvester Elorm Coch and Akwasi Akosah, Modified for submission
 */
public class RegionFinder {
	private static final int maxColorDiff = 20;				// how similar a pixel color must be to the target color, to belong to a region
	private static final int minRegion = 50; 				// how many points in a region to be worth considering
	
	private BufferedImage image;                            // the image in which to find regions
	private BufferedImage recoloredImage;                   // the image with identified regions recolored

	private ArrayList<ArrayList<Point>> regions;			// a region is a list of points
															// so the identified regions are in a list of lists of points
	

	public RegionFinder() {
		this.image = null;
	}

	public RegionFinder(BufferedImage image) {
		this.image = image;		
	}

	public void setImage(BufferedImage image) {
		this.image = image;
	}

	public BufferedImage getImage() {
		return image;
	}

	public BufferedImage getRecoloredImage() {
		return recoloredImage;
	}

	/**
	 * Sets regions to the flood-fill regions in the image, similar enough to the trackColor.
	 */
	public void findRegions(Color targetColor) {
		// creates a blank image
		BufferedImage visited = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB);
		
		// creates a list of regions
		regions = new ArrayList<ArrayList<Point>>();
		ArrayList<Point> toVisit= new ArrayList<Point>(); // a list of points to visit
		
		int pixelsize = 1; // set how close neighboring pixels to check are; a pixel from current point
		
		for (int x = 0; x < image.getWidth(); x++) {		
			for (int y= 0; y < image.getHeight(); y++) {
				
				// check if the pixel is not visited and check for color match
				if (visited.getRGB(x,y) == 0 && colorMatch(targetColor,new Color(image.getRGB(x,y)))) {
					
					visited.setRGB(x, y, 1); // set pixel to be visited
					
					ArrayList<Point> region = new ArrayList<Point>(); // current growing region
					
					//Keep track of which pixels need to be visited, initially just that first pixel
					toVisit.add(new Point(x,y));
					
					while (toVisit.size() > 0) {
						Point point1 = toVisit.get(toVisit.size()-1); // get one pixel
						region.add(point1);                           // add it to the region
						toVisit.remove(toVisit.size()-1);			  // remove from toVisit to prevent infinite loop
						
						visited.setRGB(point1.x,point1.y,1);
		
						//loop over all test Pixel's neighbors and test color math
						for ( int px = Math.max(0, point1.x-pixelsize); px < Math.min(image.getWidth(), point1.x+2);
							px++) {
							for (int py = Math.max(0, point1.y - pixelsize); py < Math.min(image.getHeight(), point1.y+2);
								py ++) {
								if (visited.getRGB(px, py)==0) {
									visited.setRGB(px, py, 1); // even if the neigbors don't match still set them to visited so we dont recheck
									
									if (colorMatch(targetColor,new Color(image.getRGB(px, py)))) {
										toVisit.add(new Point (px,py));
									}
									
								}
							}
							
						}
					}
					// only consider a region if it has at least a threshold number of points
					if (region.size() >= minRegion) {
						regions.add(region);
					}
					
				}
				
			}
		}
	}

	/**
	 * Tests whether the two colors are "similar enough" (your definition, subject to the maxColorDiff threshold, which you can vary).
	 */
	private static boolean colorMatch(Color c1, Color c2) {
		// TODO: YOUR CODE HERE
		double d = (c1.getRed() - c2.getRed())*(c1.getRed() - c2.getRed()) + (c1.getGreen() - c2.getGreen())*
				(c1.getGreen() - c2.getGreen()) + (c1.getBlue()- c2.getBlue())*(c1.getBlue()- c2.getBlue());
		d = Math.sqrt(d);

		return d < maxColorDiff;
	}

	/**
	 * Returns the largest region detected (if any region has been detected)
	 */
	public ArrayList<Point> largestRegion() {
		int largestsize = 0;
		ArrayList<Point> largest = new ArrayList<Point>();
		
		for (int idx = 0; idx < regions.size(); idx ++) {
			if (regions.get(idx).size() > largestsize) {
				largest = regions.get(idx);
				largestsize = regions.get(idx).size();
				
			}			
		}
		return largest;
			
		}
	

	/**
	 * Sets recoloredImage to be a copy of image, 
	 * but with each region a uniform random color, 
	 * so we can see where they are
	 */
	public void recolorImage() {
		// First copy the original
		recoloredImage = new BufferedImage(image.getColorModel(), image.copyData(null), image.getColorModel().isAlphaPremultiplied(), null);
		// Now recolor the regions in it
		for (ArrayList<Point> region : regions) {
			Color random = new Color((int) (Math.random()*(16777217)));
			for (Point current : region) {
				recoloredImage.setRGB(current.x, current.y, random.getRGB());
			}
		}
		
		
	}
}
