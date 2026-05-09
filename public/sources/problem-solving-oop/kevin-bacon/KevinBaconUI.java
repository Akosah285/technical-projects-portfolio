import java.awt.List;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;

/**
 * User interface for Kevin Bacon game, functionality executed based on console input
 * @authors Akwasi Akosah and Sylvester Elorm Coch, PS_4
 * Can find path from an actor to a specified center, find the most connected actor, find disconnected actors.
 * 
 */
public class KevinBaconUI {
		private Graph<String,Set<String>> overallGraph; // graph of all actors 
		private Graph<String,Set<String>> bfsGraph;     // graph returned by BFS
		private String center;                          // center of the actors universe  
		
		public KevinBaconUI() {
			KevinBaconGame kbg = new KevinBaconGame();
			overallGraph = kbg.getActorsGraph();
		}
		
		/**
		 * 
		 * @return universe of actors
		 */
		public Graph<String, Set<String>> getOverallGraph() {
			return overallGraph;
		}
		
		/**
		 * 
		 * @return bfs Graph, null if bfs has not been 
		 */
		public Graph<String, Set<String>> getBfsGraph() {
			return bfsGraph;
		}
		
		/**
		 * Command <u <name> >: 
		 * Makes a given vertex the center of the universe
		 * @param vertex, run BFS with this vertex as start
		 * 
		 */
		public void makeCenter(String vertex){
			SetCenter(vertex);
			bfsGraph = GraphLib.BFS(overallGraph, vertex);
			System.out.println(vertex + " now the center of the of the universe ");
		}
		
		public void SetCenter(String s) {
			center = s;
		}
		
		
		/**
		 * Command <p <name> >:
		 * Output the Kevin Bacon number(or the appropriate start) of this vertex
		 * Output the the movies this vertex has been in with all the actors in its path
		 */
		public void findPath(String vertex) {
			// System.out.println(bfsGraph);
			ArrayList<String> path;
			try {
				if (( path = (ArrayList<String>) GraphLib.getPath(bfsGraph, vertex)) == null) {
					System.out.println("Sorry cannot find path: " + vertex + " is not connected to " + center );
				}
				else {

					//ArrayList<String> path = (ArrayList<String>)GraphLib.getPath(bfsGraph, vertex); 
					System.out.println(vertex + "'s number is " + (path.size() - 1));
					String current = vertex;
				
				for(int i= 1; i < path.size(); i++) {
					System.out.println(current + " appeared in " + overallGraph.getLabel(current, path.get(i)) + " with " + path.get(i));
					current = path.get(i);
					}
				}
			}
			catch(Exception e) {
				System.out.println("Sorry cannot find path " + vertex + " is not connected to " + center );
			}
			
		}
		
		
		/**
		 * Command <i:>
		 *list actors with infinite separation from the current center
		 */
		public void missingActors() {
			Set<String>  missing = GraphLib.missingVertices(overallGraph, bfsGraph);
			if(missing.size() == 0) { // possible that overallGraph equals bfsGraph, has exactly the same vertices 
				System.out.println(" There are no missing vertices" ); 
			}else {               
				System.out.println("These are the actors with infinite seperations from: "+ center);
				for (String actor : missing) {
					System.out.println(actor);
				}
			
			}
		}
		
		/**
		 * d <low> <high>: list actors sorted by degree, with degree between low and high
		 */
		public void constrainedInDegree(int low, int high) {
			ArrayList<String> l = (ArrayList<String>) GraphLib.verticesByInDegree(overallGraph);
			ArrayList<String> verticesInRange = new ArrayList<String>();
			for (String vertex: l) {
				if(low <= overallGraph.inDegree(vertex) && overallGraph.inDegree(vertex) <= high) {
					verticesInRange.add(vertex);
				}	
			}
			// print this range out
			System.out.println("These actors have an indegree within the range (" +  low +", " + high + ") "+ verticesInRange);
		}
		
		
		/**
		 * s <low> <high>: list actors sorted by non-infinite separation from the current center, 
		 * with separation between low and high
		 * Actors that are are high to low steps away from the current center
		 */
		public void ConstrainedNonInfiniteSeparation(int low, int high) {
			ArrayList<String> vertices = new ArrayList<String>();

			for (String vertex : bfsGraph.vertices()) vertices.add(vertex); // initially add all vertices to list
				
			// checks to remove vertices that are out of the range (high and low)
			
			int i = 0;
			while (i < vertices.size()  && vertices.size() != 0) {
				int separation = GraphLib.numberSeparations(bfsGraph,  vertices.get(vertices.size() - 1 - i));
				
				
				if((low > separation) || (high < separation)) {
					vertices.remove(vertices.size() - 1 - i);
					
				}
				else i ++ ;
				
			}
			
			System.out.println("These are actors are separated from " + center + " by " + low +"-" + high + " steps: ");
			for (String actors : vertices) {
				System.out.println(actors);
			}
		}
		
		
		
		/**
		 * Command: g counts how many actors are connected to current 
		 * number of actors who have a path (connected by some number of steps) to the current center
		 */
		public void countConnectedVertices() {
			int count = 0;
		
			for (String vertex : bfsGraph.vertices()) {
				count ++;
			}
			
			System.out.println("Number of actors connected to " + center + ": " + (count - 1));
		}
		
		
		/**
		 * the average path length over all actors who are connected by some path to the current center
		 */
		public void averagePathLength() {
			System.out.println("The average separation from the " + center + "is " + GraphLib.averageSeparation(bfsGraph, center));
		}
		
		
		/**
		 * Command: w 
		 * Other possible Bacons, criteria InDegree. Most connected actor has the highest inDegree
		 */
		public void determineBestByInDegree() {
			ArrayList<String> l = (ArrayList<String>) GraphLib.verticesByInDegree(overallGraph);
			System.out.println("This is the most connected actor by Indegree " + l.get(0));	
			
		}
		
		/**
		 * command: r
		 * Other possible Bacons, criteria Average Separation. Most connected actor has the highest Average Separation
		 * 
		 */
		public void determineBestByAverageSeparation() {
		if( center != null) {	
			Graph<String,Set<String>> substituteBaconGraph = GraphLib.BFS(overallGraph, center ); //
			
			Map<Double, String> mapAvgToActor = new HashMap<Double, String>();
			
			for (String vertex : substituteBaconGraph.vertices()) {
				double avg = GraphLib.averageSeparation(GraphLib.BFS(overallGraph, vertex ), vertex);
				mapAvgToActor.put(avg, vertex);
				}
			 
			ArrayList<Double> sortedAvg = new ArrayList<Double>();
			sortedAvg.addAll(mapAvgToActor.keySet());
			sortedAvg.sort(null);
			System.out.println("Map of average separation to "+ center + " " + mapAvgToActor);
			System.out.println("Sorted Averages " + sortedAvg);
			System.out.println("This is is the most connected actor by average separation " + mapAvgToActor.get(sortedAvg.get(0)));
		}
		else { 
			   System.out.println("No center of the acting univerese: Cannot analyse average separations. Make someone the center ");
			}
		}
		
		/**
		 * command: c <# number>
		 * @param number, if positive, lists top number actors by average separation
		 * if negative, lists least number actors by average separation
		 */
		public void listCentersbyAvgSeparation(int number) {
			if(center != null ) {
				Graph<String,Set<String>> substituteBaconGraph = GraphLib.BFS(overallGraph, "Kevin Bacon" ); // always applies solely to Kevin Bacon universe
				
				Map<Double, String> mapAvgToActor = new HashMap<Double, String>();
				
				for (String vertex : substituteBaconGraph.vertices()) {
					double avg = GraphLib.averageSeparation(GraphLib.BFS(overallGraph, vertex ), vertex);
					mapAvgToActor.put(avg, vertex);
					}
				 
				ArrayList<Double> sortedAvg = new ArrayList<Double>();
						sortedAvg.addAll(mapAvgToActor.keySet());
						sortedAvg.sort(null);
				
				 // Begin listing the actors depending on number
			     if (number < 0) {
			    	 System.out.println("Ranked by decreasing order of average separation");
			    	 for( int i =0 ; i < Math.abs(number); i++){
			    		 System.out.println(i+1 + " -> "+  mapAvgToActor.get(sortedAvg.get(sortedAvg.size() - 1 )));
			    	 }
			     }
			     if (number > 0) {
			    	 System.out.println("Ranked by ascending order of average separation");
			    	 for ( int i = 0 ; i < number ; i ++ ) {
			    		 System.out.println(i +1 +" -> "+ mapAvgToActor.get(sortedAvg.get(i)));
			    	 }
			     }
			}else {
				System.out.println("No center of the acting universe. Cannot rank actors based on Average separation");
			}
		}
		
		/**
		 * Commands:
			c <#>: list top (positive number) or bottom (negative) <#> centers of the universe, sorted by average separation
			d <low> <high>: list actors sorted by degree, with degree between low and high
			i: list actors with infinite separation from the current center
			p <name>: find path from <name> to current center of the universe
			s <low> <high>: list actors sorted by non-infinite separation from the current center, with separation between low and high
			u <name>: make <name> the center of the universe
			w: determines best center of acting universe by in degree
			r: determines best center of acting universe by average Separation
			g: finds the number of actors connected to the current center
			q: quit game
		 */
		
		
		public static void main(String[] args) {
		KevinBaconUI KU = new KevinBaconUI(); // set up the functionality for user interactions
		
		Scanner in = new Scanner(System.in);
		while (true) {
			System.out.println();
			System.out.println("Type in your command"); // request user input
			
			String line = in.nextLine();
			String[] terms = line.split(" ");
			//for(String d : terms) System.out.println("This " + d);// for error checking
			
			// Command: u <actor name> makes the actor the center of the acting univers
			if(terms[0].equals("u")){
				
				String actor = "";
				for(int i = 1 ; i < terms.length - 1; i++) { // gets all other names and concatenates 
					actor += terms[i] + " ";
				}
				actor += terms[terms.length - 1]; // gets the last name of the actor. 
				if(!KU.getOverallGraph().hasVertex(actor)) System.out.println("Incorrect actor name: Try again ");
				else KU.makeCenter(actor); 
			}
			
			// command: p <actor name> finds the path from the actor to the current of the center
			else if( terms[0].equals("p")){
				if(KU.getBfsGraph() == null) System.out.println("Run bfs first before requesting for the path");
				else {
					String actor = "";
					for(int i = 1 ; i < terms.length - 1; i++) { // gets all other names and concatenates 
					actor += terms[i] + " ";
					}
				
					actor += terms[terms.length - 1]; // gets the last name of the actor. 
					if(!KU.getOverallGraph().hasVertex(actor)) System.out.println("Incorrect actor name: Try again ");
					else KU.findPath(actor); 
				}
			}
				
	
			// command : i: list actors with infinite separation from the current center
			else if( terms[0].equals("i")){
					if(KU.getBfsGraph() == null) System.out.println("Run bfs first before requesting for the missing actors");
					else {
						KU.missingActors();
				}
			}
			
			// command : d <low> <high> : list actors with inDegrees between high and low
			else if( terms[0].equals("d")){
					int high, low;
					try {
					low = Integer.parseInt(terms[1]);
					high = Integer.parseInt(terms[2]);
						if( low > high) {
							System.out.println("Low must be less than high");	
						}
						if(low < 0 || high < 0) System.out.println("Low and high must be non-negative ");
						else if (low >= 0 && high >= 0)KU.constrainedInDegree(low, high);
					
					}catch(Exception e) {
						System.out.println("Invalid high and low: Re-enter high and low");
					}
				}
			
			// command: q quits the game
			else if( terms[0].equals("q")){
				System.out.println("You have quit the game ");
				break ; // break out of the loop	
			}
			
			// command : s < high> <low> 
			// actors sorted by non-infinite separation from the current center, with separation between low and high
			else if( terms[0].equals("s")){
				int high, low;
				try {
				low = Integer.parseInt(terms[1]);
				high = Integer.parseInt(terms[2]);
					if( low > high) {
						System.out.println("Low must be less than high");	
					}
					if(low < 0 || high < 0) System.out.println("Low and high must be non-negative ");
					else if(KU.getBfsGraph() == null) System.out.println(" Cannot analyse separations. No center found. Run bfs on the center" );
					else if (low >= 0 && high >= 0) KU.ConstrainedNonInfiniteSeparation(low, high);
					
				}catch(Exception e) {
					System.out.println("Invalid high and low: Re-enter high and low " + e);
				}
			}
			
			// command: w determine the best actor by in degree
			else if( terms[0].equals("w")){
				try {
					KU.determineBestByInDegree();
				}catch(Exception e) {
					System.out.println(" Could not find the best actor by Indegree " + e);
				}
			}
			
			// command: r determine the best actor by average Separation
			else if( terms[0].equals("r")){
				try {
					KU.determineBestByAverageSeparation();
				}catch(Exception e) {
					System.out.println(" Could not find the best actor by Average Separation " + e);
				}
			}
			
			// command: c <number> list the top or least number of actors by average separation
			else if (terms[0].equals("c")){
				int number = Integer.parseInt(terms[1]);
				try {
					KU.listCentersbyAvgSeparation(number);
				}
				catch(Exception e) {
					System.out.println("Invalid number format : Re- enter ");
				}
			}
			
			// command: g <number> Finds the number of actors that are connected to current center of acting universe
			else if (terms[0].equals("g")){
				try {
					if(KU.getBfsGraph() == null) System.out.println(" Please make sure you've run bfs on a specific center");
					else KU.countConnectedVertices();
				}
				catch(Exception e) {
					System.out.println("Error finding the number of connected actors : Re - enter command ");
				}
			}
			else {
				 System.out.println("Invalid operation: Re - type your command ");
			}
		}	
	
	}
}


		
