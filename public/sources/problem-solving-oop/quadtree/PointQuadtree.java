	import java.util.ArrayList;
import java.util.List;

/**
 * A point quadtree: stores an element at a 2D position, 
 * with children at the subdivided quadrants
 * 
 * @author Chris Bailey-Kellogg, Dartmouth CS 10, Spring 2015
 * @author CBK, Spring 2016, explicit rectangle
 * @author CBK, Fall 2016, generic with Point2D interface
 * @authors Akwasi Akosah and Sylvester Elorm Coch , completed for submission 
 * 
 */
public class PointQuadtree<E extends Point2D> {
	private E point;							// the point anchoring this node
	private int x1, y1;							// upper-left corner of the region
	private int x2, y2;							// bottom-right corner of the region
	private PointQuadtree<E> c1, c2, c3, c4;	// children

	/**
	 * Initializes a leaf quadtree, holding the point in the rectangle
	 */
	public PointQuadtree(E point, int x1, int y1, int x2, int y2) {
		this.point = point;
		this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
	}

	// Getters
	
	public E getPoint() {
		return point;
	}

	public int getX1() {
		return x1;
	}

	public int getY1() {
		return y1;
	}

	public int getX2() {
		return x2;
	}

	public int getY2() {
		return y2;
	}

	/**
	 * Returns the child (if any) at the given quadrant, 1-4
	 * @param quadrant	1 through 4
	 */
	public PointQuadtree<E> getChild(int quadrant) {
		if (quadrant==1) return c1;
		if (quadrant==2) return c2;
		if (quadrant==3) return c3;
		if (quadrant==4) return c4;
		return null;
	}

	/**
	 * Returns whether or not there is a child at the given quadrant, 1-4
	 * @param quadrant	1 through 4
	 */
	public boolean hasChild(int quadrant) {
		return (quadrant==1 && c1!=null) || (quadrant==2 && c2!=null) || (quadrant==3 && c3!=null) || (quadrant==4 && c4!=null);
	}

	/**
	 * Inserts the point into the tree
	 */
	public void insert(E p2) {
		// check if point is in quadrant 1 - upper left
		if(p2.getX() < getPoint().getX() && p2.getY() < getPoint().getY()) { 
			if (hasChild(1)) c1.insert(p2); // recursively call insert on this child/quadrant 1
			
			else {//  it has no quadrant 1.(base case)
				
				int newX1 = getX1();				// update the x1,y1, x2,y2 of the child(quadrant) 1 
				int newY1 = getY1();
				int newX2 = (int)getPoint().getX();
				int newY2 = (int)getPoint().getY();
				
				c1 = new PointQuadtree<E>(p2, newX1, newY1, newX2 , newY2 ); // create quadrant 1, correct positions and node.
				}
			}
		
		// check quadrant 2 - top right
		else if(p2.getX() > getPoint().getX() && p2.getY() < getPoint().getY()) {
			if (hasChild(2)) c2.insert(p2);      // recursively call insert on this child/quadrant 2
			
			else {//  it has no quadrant 2.(base case)
				
				int newX1 = (int)getPoint().getX();  // update the x1,y1, x2,y2 of the child(quadrant) 2 
				int newY1 = getY1();
				int newX2 = (int)getX2();
				int newY2 = (int)getPoint().getY();
				
				c2 = new PointQuadtree<E>(p2, newX1, newY1, newX2 , newY2 ); // create quadrant 2, correct positions and node.
				}
		}
		
		// check quadrant 3 - left bottom
		else if(p2.getX() < getPoint().getX() && p2.getY() > getPoint().getY()) {
			if (hasChild(3) ) c3.insert(p2);      // recursively call insert on this child/quadrant 3
			
			else {//  it has no quadrant 3.(base case)
				
				int newX1 = getX1();                // update the x1,y1, x2,y2 of the child(quadrant) 3 
				int newY1 = (int)getPoint().getY();
				int newX2 = (int)getPoint().getX();
				int newY2 = (int)getY2();
				
				c3 = new PointQuadtree<E>(p2, newX1, newY1, newX2 , newY2 ); // create quadrant 3, correct positions and node.
				}

		}
		
		// check quadrant 4 - right bottom
		else if(p2.getX() > getPoint().getX() && p2.getY() > getPoint().getY()) {
			if (hasChild(4)) c4.insert(p2);     // recursively call insert on this child/quadrant 4
			
			else {//  it has no quadrant 4.(base case)
				
				int newX1 = (int)getPoint().getX();  // update the x1,y1, x2,y2 of the child(quadrant) 4
				int newY1 = (int)getPoint().getY();
				int newX2 = (int)getX2();
				int newY2 = (int)getY2();
				
				c4 = new PointQuadtree<E>(p2, newX1, newY1, newX2 , newY2 ); // create quadrant 4, correct positions and node.
				}
		}
			
	}
	
	/**
	 * Finds the number of points in the quadtree (including its descendants)
	 */
	public int size() {
		// TODO: YOUR CODE HERE
		int total = 1;
		
		if (hasChild(1))  total += c1.size(); 
		if (hasChild(2))  total += c2.size();
		if (hasChild(3))  total += c3.size();
		if (hasChild(4))  total += c4.size();
		
		return total;
	}
	
	/**
	 * Builds a list of all the points in the quadtree (including its descendants)
	 */
	public List<E> allPoints() {
		// TODO: YOUR CODE HERE
		List<E> pointsList = new ArrayList<E>(); // list interface implemented with an ArrayList
		allPointsHelper(pointsList); // accumulator
		return pointsList;	
	}	

	/**
	 * Uses the quadtree to find all points within the circle
	 * @param cx	circle center x
	 * @param cy  	circle center y
	 * @param cr  	circle radius
	 * @return    	the points in the circle (and the qt's rectangle)
	 */
	public List<E> findInCircle(double cx, double cy, double cr) {
		// TODO: YOUR CODE HERE
		List<E> pointsInCircle = new ArrayList<E>();
		findInCircleHelper(pointsInCircle, cx, cy, cr);
		return pointsInCircle;
		
	}
	
	
	// TODO: YOUR CODE HERE for any helper methods
	private void allPointsHelper(List<E> list) {
		if (getPoint() != null) {
			list.add(getPoint());}
		
		if (hasChild(1)) getChild(1).allPointsHelper(list);
		if (hasChild(2)) getChild(2).allPointsHelper(list);
		if (hasChild(3)) getChild(3).allPointsHelper(list);
		if (hasChild(4)) getChild(4).allPointsHelper(list);
				
	
	}
	
	private void findInCircleHelper(List<E> list, double cx, double cy, double cr) {
		if (Geometry.circleIntersectsRectangle(cx, cy, cr, getX1(), getY1(), getX2(), getY2())) {
			if(Geometry.pointInCircle(getPoint().getX(),getPoint().getY(), cx, cy, cr))list.add(getPoint());
			
			if (hasChild(1)) c1.findInCircleHelper(list, cx, cy, cr);
			if (hasChild(2)) c2.findInCircleHelper(list, cx, cy, cr);
			if (hasChild(3)) c3.findInCircleHelper(list, cx, cy, cr);
			if (hasChild(4)) c4.findInCircleHelper(list, cx, cy, cr);
		}
	}
}
