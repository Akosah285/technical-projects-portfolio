

import java.awt.Graphics;
import java.util.ArrayList;
import java.util.List;

public class Sketch {
	private List<Shape> shapes;  // implement a list to hold your shapes
								// saves us to trouble of assigning id to shapes, id will be just the index
	
	public Sketch(){
		shapes = new ArrayList<Shape>();
	}
	
	// add shapes to master sketch
	public synchronized void add(Shape shape){
		shapes.add(shape);
	}
	
	// delete shape from master sketch
	public synchronized void delete(int i){
		if(i < shapes.size() && i >= 0) shapes.remove(i);
	}
	
	// helpful to know size of list for painting
	public synchronized int size(){
		return shapes.size();
	}
	
	public synchronized Shape retrieve(int i){
		if(i < shapes.size() && i >= 0) {
			return shapes.get(i);
		}
		else return null;
	}
	
	// get to index of the topmost layer
	public synchronized int topMost(int x, int y){
		// from the back, we get the top item
		for(int i = shapes.size() - 1; i >= 0; i--){
			if(shapes.get(i).contains(x, y)) return i;
		}	
		return -1; // not found
	}
	// ask sketch to draw all shapes in its list
	public synchronized void draw(Graphics g){
		for(int i = 0; i < shapes.size(); i++) {
			shapes.get(i).draw(g);
		}
	}
}
