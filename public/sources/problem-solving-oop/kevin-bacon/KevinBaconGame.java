import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

/**
 * 
 * @authors Sylvester Elorm Coch and Akwasi Akosah, PS_4
 * Creates a graph of actors given certain input files
 */
public class KevinBaconGame {
	private String actorIDActorFile = "inputs/actors.txt";   // file containing ActorIDs to ActorNames
	private String movieIDMovieFile = "inputs/movies.txt";   // file containing MovieIDs to MovieNames
	private String movieIDActorIDFile = "inputs/movie-actors.txt"; // file containing MovieIDs to ActorIDs
	private Graph<String, Set<String>> actorsGraph; // graph for all the actors
	private Map<String, Set<String>> commonActors;
	private Map<String, String> actorIdActor;
	
	
	public KevinBaconGame() {
	commonActors = findRelatedActors();
	generateGraph();
	}
	
	public Graph<String, Set<String>> getActorsGraph() {
		return actorsGraph;
	}

	
	/**
	 * Map of actorID - > Actor Names
	 */
	public Map<String, String> mapIDtoActors(){
		Map<String, String> ActorMap = new HashMap<String, String>();
		try {
			BufferedReader in = new BufferedReader(new FileReader(actorIDActorFile));
			String line;
			while((line = in.readLine())!= null){
				
				String[] data = line.split("\\|");
				
				ActorMap.put(data[0], data[1]);	
			}
		}catch(Exception e) {
			System.out.println("Problem handling file ActorIdToActor File " + e);
		}
		return ActorMap;
	}
	
	/**
	 * Map of MovieID -> Movie names
	 * 
	 */
	public Map<String, String> mapIDtoMovies(){
		Map<String, String> MovieMap = new HashMap<String, String>();
		try {
			BufferedReader in = new BufferedReader(new FileReader(movieIDMovieFile));
			String line;
			while((line = in.readLine())!= null){
				
				String[] data = line.split("\\|");
				
				MovieMap.put(data[0], data[1]);	
			}
			in.close();
			
		}catch(Exception e) {
			System.out.println("Problem handling file MovieIdToMovie File " + e);
		}
		
		return MovieMap;
	}
	

	/**
	 * Map of MovieID -> ActorID
	 * 
	 */
	public Map<String, Set<String>> mapMovieIDtoActorID(){
		Map<String, Set<String>> idMap = new HashMap<String, Set<String>>();
		try {
			BufferedReader in = new BufferedReader(new FileReader(movieIDActorIDFile));
			String line;
			while((line = in.readLine())!= null){
				
				String[] data = line.split("\\|");
				if(!idMap.containsKey(data[0])) {
					idMap.put(data[0], new HashSet<String>());
					String actorId = data[1];
					idMap.get(data[0]).add(actorId);

				}
				else {
					String actorId = data[1];
					idMap.get(data[0]).add(actorId);
				}
			}
		}catch(Exception e) {
			System.out.println("Problem handling file MovieIdToActorId File " + e);
		}
		return idMap;
	}
	
	/**
	 * maps movie -> set of actors in that movie
	 * 
	 */
	public Map<String, Set<String>> findRelatedActors(){
		Map<String, String> movieIdMovie = mapIDtoMovies(); 
		actorIdActor = mapIDtoActors(); 
		Map<String, Set<String>> movieIdActorID = mapMovieIDtoActorID();
		
		// map of movie -> {common actors}
		Map<String, Set<String>> commonActors  = new HashMap<String, Set<String>>();
		
		for(String movieID : movieIdActorID.keySet()) {
			commonActors.put(movieIdMovie.get(movieID), new HashSet<String>());
			for (String actorID: movieIdActorID.get(movieID)) {
				commonActors.get(movieIdMovie.get(movieID)).add(actorIdActor.get(actorID));             // movie -> {actor1}
			}
		}	
		
		// System.out.println("This is the map of movie -> common actors " +commonActors);
		return commonActors;
		
	}
	
	/**
	 * Generate graph with actors as vertices and common movies as edgelabels
	 */
	public void  generateGraph(){
		actorsGraph = new AdjacencyMapGraph<String, Set<String>>();
		
		// insert all the actors
		for (String actor : actorIdActor.keySet()) {
			actorsGraph.insertVertex(actorIdActor.get(actor));
		}
		
		// insert undirected edges between common actors in the same movie, using common movies as edge label
		for( String movie : commonActors.keySet()) {
			for (String actor : commonActors.get(movie)) {
				for (String otherActor : commonActors.get(movie)) {
				       if(!actor.equals(otherActor) && !actorsGraph.hasEdge(actor, otherActor)) {
				    	   actorsGraph.insertUndirected(actor, otherActor, new HashSet<String>());  
				    	   actorsGraph.getLabel(actor, otherActor).add(movie);
				       }else if(!actor.equals(otherActor) && actorsGraph.hasEdge(actor, otherActor)){
				    	   actorsGraph.getLabel(actor, otherActor).add(movie);
				       }
				}	
			}			
		}
			
	}

	
}
