import java.util.*;

/**
 * Library for graph analysis
 * 
 * @author Chris Bailey-Kellogg, Dartmouth CS 10, Fall 2016
 * @author modified by Akwasi Akosah and Sylvester Elorm Coch for submission
 */
public class GraphLib {
	/**
	 * Takes a random walk from a vertex, up to a given number of steps
	 * So a 0-step path only includes start, while a 1-step path includes start and one of its out-neighbors,
	 * and a 2-step path includes start, an out-neighbor, and one of the out-neighbor's out-neighbors
	 * Stops earlier if no step can be taken (i.e., reach a vertex with no out-edge)
	 * @param g		graph to walk on
	 * @param start	initial vertex (assumed to be in graph)
	 * @param steps	max number of steps
	 * @return		a list of vertices starting with start, each with an edge to the sequentially next in the list;
	 * 			    null if start isn't in graph
	 */
	public static <V,E> List<V> randomWalk(Graph<V,E> g, V start, int steps) {
		// TODO: your code here
		int count = 0;                          // keeps track of how many steps so far
		ArrayList<V> path = new ArrayList<V>(); // path of the vertices traversed
		
		// if steps == 0, return list with start vertex
		if (steps == 0) {
			path.add(start);
			return path;	
		
		// makes sure steps are positive
		}else if(steps > 0) {

			V currentVertex = start;
			path.add(start);
			
			while (count < steps) {
				// get the outNeighbours 
				Iterable<V> outNeighbours = g.outNeighbors(currentVertex);
				
				// covert to out neighbors arraylist in order to obtain a random out neighbor
				ArrayList<V> randomNeighbours = new ArrayList<V>();
				for (V vertex : outNeighbours) {
					randomNeighbours.add(vertex);
				}
				 
				
				if(!randomNeighbours.isEmpty()) {
				// get a random neighbor
				V nextVertex = randomNeighbours.get((int)(Math.random() * randomNeighbours.size()));
				
				// add to path
				path.add(nextVertex);
				
				
				
				// update current vertex
				currentVertex = nextVertex;
				}
				
				// increase count
				count += 1;
			}
		}
		
		return path; // arrayList of each vertex gotten from random path from start
		
	}
	/**
	 * 
	 * 
	 * Compares two vertices by their in -degrees
	 * @param <V>  Vertice
	 * @param <E>  Edge lable
	 */
	 class InDegreeComparator<V, E> implements Comparator<V>{
		Graph<V,E> graph;
		
	    public InDegreeComparator(Graph<V,E> g) {
			graph = g;
		}	
	    
		@Override
		public int compare( V v1, V v2) {
			// TODO Auto-generated method stub
			return graph.inDegree(v2) - graph.inDegree(v1);
		}
	}
	
	/**
	 * Orders vertices in decreasing order by their in-degree
	 * @param g		graph
	 * @return		list of vertices sorted by in-degree, decreasing (i.e., largest at index 0)
	 */
	public static <V,E> List<V> verticesByInDegree(Graph<V,E> g) {
		// TODO: your code here
		
		List<V> verticesList = new ArrayList<V>(); // list of vertices sorted by in-degree
		
		for (V vertex : g.vertices())
		{
			verticesList.add(vertex);
		}
		GraphLib graphAnalyser = new GraphLib();
		
		verticesList.sort( graphAnalyser.new InDegreeComparator<V,E>(g)); // sorts using the sort method and an Indegree comparator
		
		return verticesList; // returns the sorted list
		
	}
	
	/**
	 * 
	 * @param G, graph to traverse
	 * @param start, begin search from start
	 * @return pathTree, also a graph containing the shortest path to all reachable nodes from start.
	 * 
	 */
	public static <V,E> Graph<V,E>  BFS(Graph<V,E> G, V start) {
		//System.out.println("\nBreadth First Search from " + start);
		
		Graph<V, E> pathTree = new AdjacencyMapGraph<V, E>(); 
		
		Set<V> visited = new HashSet<V>(); //Set to track which vertices have already been visited
		Queue<V> queue = new LinkedList<V>(); //queue to implement BFS
		
		queue.add(start); //enqueue start vertex
		visited.add(start); //add start to visited Set
		while (!queue.isEmpty()) { //loop until no more vertices
			V u = queue.remove(); //dequeue
			if(!pathTree.hasVertex(u)) { // only insert if graph does not have this vertex, else we could 
				pathTree.insertVertex(u); 
			}
			for (V v : G.outNeighbors(u)) { //loop over out neighbors
				if (!visited.contains(v)) { //if neighbor not visited, then neighbor is discovered from this vertex
					visited.add(v); //add neighbor to visited Set
					queue.add(v); //enqueue neighbor
					pathTree.insertVertex(v);// insert this neighbor into the graph
					pathTree.insertDirected( v, u,  G.getLabel(v, u));// inserted a directed graph from v to u, with the appropriate edge label
					
				}
			}
		}
		
		return pathTree;
	}
	
	/**
	 * @param tree, obtained after running BFS
	 * @param v,  goal vertex
	 * @return path from the root(start vertex) to V(goal vertex)
	 * 
	 * develop path beginning from the goal, going up until we've reached the root
	 */
	public static <V,E> List<V> getPath(Graph<V,E> tree, V v){
		V current = v;
		List<V> path = new ArrayList<V> (); // path from root to vertex v
		path.add(v);  
		while(tree.outDegree(current) != 0) {
			// System.out.println("Developing this path " + path); // uncomment to see how path is formed
			for(V vertex : tree.outNeighbors(current)){ // every child will have one parent (ie. 1 outneighbour) 
				path.add(vertex);
				current = vertex;
			}
		}
		return path;
	}
	
	/**
	 * 
	 * @param graph
	 * @param subgraph
	 * @return Set of vertices contained in graph but not in subgraph.
	 */
	public static <V,E> Set<V> missingVertices(Graph<V,E> graph, Graph<V,E> subgraph){
		Set<V> lostVertices = new HashSet<V>();
		for( V vertex : graph.vertices()) {
			if(!subgraph.hasVertex(vertex)) {
				lostVertices.add(vertex);
			}
		}
		return lostVertices;
	}
	
	// Calculates the average separation of all vertices from the root
	public static <V,E> double averageSeparation(Graph<V,E> tree, V root) {
		double numberOfVertices = (double) (tree.numVertices() - 1); // find number of vertices within the tree obtained from BFS not counting the root
		double totalSeparations = (double)  count(tree, root, 0);    // recursively find the separations of each neighbor from the root
		return   totalSeparations/ numberOfVertices;
	}
	
	// helper method count ( counts the total number of separations between each vertex and the root)
	public static <V, E> double  count(Graph<V, E> tree, V vertex, int depth){
		double number = depth;
		if(tree.inDegree(vertex) != 0) {
			for (V u : tree.inNeighbors(vertex)) {
			number += count(tree, u, depth + 1 );
			}
		}
		return number;
	}
	
	
	// returns the number of separations from a given vertex to the root
	public static <V, E> int numberSeparations(Graph<V, E> tree, V vertex) {
		V current = vertex;
		int separations = 0;
		
		while (tree.outDegree(current) != 0) {
			// System.out.println("Developing this path " + path); // uncomment to see how path is formed
			for(V v : tree.outNeighbors(current)){ // every child will have one parent (ie. 1 outneighbour) 
				separations ++;
				current = v;
			}
		}
		return separations;
	}
}	
	
