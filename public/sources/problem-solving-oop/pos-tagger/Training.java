import java.awt.List;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
/**
 *
 * @authors AKwasi Akosah, Sylvester Elorm Coch
 * Predicts the part of speech of a words in a sentence
 * based Hidden Markov Models and Viterbi's algorithm 
 */
public class Training {
	private BufferedReader partOfSpeechReader;  // read POS  file
	private BufferedReader sentenceReader;		// reader for file containing correct sentences
	
	private final double PENALTY = 100.00;      // penalty : modify this and see what happens?
	
	private Map<String, Map<String, Double>> transitions;       // transition probabities
	private Map<String, Map<String, Double>> observationCount;  // make observation probabilities of a word and corresponding part of speech
	
	private String trainTags = "inputs/simple-train-tags.txt";  // train model with tags
	private String trainSentences = "inputs/simple-train-sentences.txt"; // train model with sentences
	private String testSentence = "inputs/simple-test-sentences.txt";  // test model with sentences
	private String testTags = "inputs/simple-test-tags.txt"; 		// test model with tags
	
	
	public Training() {
		computeTransitions();
		makeObservations();
		observationsCount();
		performanceAccuracy();		
		
	}
	
	/**
	 * creates a map for part of speech and the number of times they appeared in text
	 * @return map of part of speech and frequencies
	 */
	public Map<String, Double> countPOS(){
		Map<String, Double> POStoCount = new HashMap<String, Double>();
		try {
			partOfSpeechReader = new BufferedReader(new FileReader(trainTags));
			String line;
			while((line = partOfSpeechReader.readLine()) != null) {
				String[] terms = line.split(" ");
				
				if(POStoCount.containsKey("#")) {
					POStoCount.put("#", POStoCount.get("#") + 1.0);
				}
				else {
					POStoCount.put("#", 1.0);
				}
				for (String POS : terms) {
					if(POStoCount.containsKey(POS)) {
						POStoCount.put(POS, POStoCount.get(POS) + 1.0);
					}
					else {
						POStoCount.put(POS, 1.0);
					}
				}
			}
		}
		catch (Exception e) {
			System.out.println("Could not open file for reading " + e);
		}
		finally {
			try {
				partOfSpeechReader.close();
			} catch (IOException e) {
				System.out.println("Could not close opened file "+ e);
			}
		}
		return POStoCount;
	}
	
	/**
	 * 
	 * @return the number of transitions from a part of speech to another
	 */
	public Map<String, Map<String, Double>> transitionCounts(){ 
		Map<String, Map<String,Double>> transitionalCounts = new HashMap<String, Map<String,Double>>();
		
		try {
			partOfSpeechReader = new BufferedReader(new FileReader(trainTags));
			String line;
			
			while((line = partOfSpeechReader.readLine()) != null) {
				String [] terms = line.split(" ");
				if(transitionalCounts.containsKey("#")){
					if(transitionalCounts.get("#").containsKey(terms[0])) {							
						transitionalCounts.get("#").put(terms[0], transitionalCounts.get("#").get(terms[0]) +1.0 );
					}
					else {
						transitionalCounts.get("#").put(terms[0],1.0);
					}
				}
				else {
					Map<String,Double> nextPOS = new HashMap<String, Double>();
					nextPOS.put(terms[0], 1.0);
					transitionalCounts.put("#", nextPOS);
					
				}
				for(int i = 0; i < terms.length - 1; i ++) {
					if(transitionalCounts.containsKey(terms[i])){
						if(transitionalCounts.get(terms[i]).containsKey(terms[i+1])) {							
							transitionalCounts.get(terms[i]).put(terms[i+1], transitionalCounts.get(terms[i]).get(terms[i+1]) + 1.0 );	
						}
						else {
							transitionalCounts.get(terms[i]).put(terms[i+1],1.0);
						}
					}
					else {
						Map<String,Double> nextPOS = new HashMap<String, Double>();
						nextPOS.put(terms[i+1], 1.0);
						transitionalCounts.put(terms[i], nextPOS);	
					}
				}
			}
		}
		catch (Exception e) {
			System.out.println("Could not open file for reading : problem with counting transitions " + e);	
		}
		finally {
			try {
				partOfSpeechReader.close();
			} catch (IOException e) {
				System.out.println("Could not close opened file "+ e);
			}
		}
		return transitionalCounts;
	}
	
	/**
	 * compute transitional probabilities from one part of speech to the another
	 */
	public void computeTransitions() {
		transitions = new HashMap<String, Map<String, Double>>();
		Map<String,Map<String,Double>> transCountMap = transitionCounts();
		
		for (String POS : transCountMap.keySet()) {
			transitions.put(POS, new HashMap<String,Double>());
			for(String POStrans : transCountMap.get(POS).keySet()) {
				
				double transNum = transCountMap.get(POS).get(POStrans);
				Map<String,Double> numPOS = countPOS();
				double totalPOS = numPOS.get(POS);
				transitions.get(POS).put(POStrans,Math.log((transNum/totalPOS)));
			}
		}
		
	}
	
	/**
	 * Helper method to compute the number of observations within each part of speech category
	 * Map: POS -> ( word -> count) 
	 * 
	 */
	public Map<String,Map<String,Double>> makeObservations() {
		// try reading both text and parts of speech files
		Map<String,Map<String,Double>>observations = new HashMap<String, Map<String,Double>>();
		
		try {
			partOfSpeechReader = new BufferedReader(new FileReader(trainTags));
			sentenceReader = new BufferedReader(new FileReader(trainSentences));
			
			String partsOfSpeechLine, sentence;
			
			while((partsOfSpeechLine = partOfSpeechReader.readLine()) != null && (sentence = sentenceReader.readLine()) != null){
			
				String[] partsOfSpeech = partsOfSpeechLine.split(" ");  // tokenize both files
				String[] sentenceText = sentence.split(" ");
				
				
				for(int i = 0; i < sentenceText.length; i ++) {
					String POS = partsOfSpeech[i];
					String word = sentenceText[i];					
					// 
					if (observations.containsKey(POS)) {
						if(observations.get(POS).containsKey(word)) {
							observations.get(POS).put(word, observations.get(POS).get(word)+1);
						}
						else {
							observations.get(POS).put(word,1.0);
						}
						
					}
					else {
						Map<String,Double> newPOS = new HashMap<String, Double>();
						newPOS.put(word, 1.0);
						observations.put(POS, newPOS);
					}
				}
			}
		}
		catch (Exception e) {
			System.out.println("Could not open file"+ e);
		}
		finally {
			try {
				partOfSpeechReader.close();
				sentenceReader.close();
			}catch(IOException e) {
				System.out.println("Could not close files" +e);
			}
		}
		return observations;
	}
	
	/**
	 * 
	 */
	public void observationsCount(){
		Map<String,Double> POStotal = countPOS();
		Map<String,Map<String,Double>> myObservations = makeObservations();//new HashMap<String,Map<String,Double>>();
		observationCount = new HashMap<String,Map<String,Double>>();
		observationCount.put("#", new HashMap<String,Double>());
		observationCount.get("#").put("#",0.0);
		
		for(String partOfSpeech : myObservations.keySet()) {
			observationCount.put(partOfSpeech,new HashMap<String,Double>());
			
			for(String word : myObservations.get(partOfSpeech).keySet()) {
				observationCount.get(partOfSpeech).put(word, Math.log((myObservations.get(partOfSpeech).get(word))/(POStotal.get(partOfSpeech))));		
			}
			
		}		
	}
	
	/**
	 * 
	 * @param sentence, containing POS to predict
	 * @return Viterbi tags, containing predictions for words' parts of speech in sentence
	 */
	public ArrayList<String> Viterbi(String sentence) {
				
		Set<String> currStates = new HashSet<String>(); // set of the current states 
		Map<String,Double> currScores = new HashMap<String,Double>(); // maps current states to current scores 
		
		currStates.add("#");         // starts from the # sign
		currScores.put("#", 0.0);    // put the start of the sentence and score as 0
		
		ArrayList<Map<String,String>> backtrack = new ArrayList<Map<String,String>>(); // Observation # -(
		ArrayList<String> viterbiTags = new ArrayList<String>(); // parts of speech tags
		
		String[] obs = sentence.toLowerCase().split(" ");  // split observed words in a sentence and save in array, convert to lower case
		
		for(int k = 0 ; k< obs.length; k++) { // iterate the lists of words
			
			Set<String> nextStates = new HashSet<String>();  // the next states from a given current state
			Map<String,Double> nextScores = new HashMap<String,Double>();
			backtrack.add(k,new HashMap<String,String>());
			
			for (String currState : currStates) {
				if(transitions.get(currState)!= null) {
					for (String nextState : transitions.get(currState).keySet()) {
					
						nextStates.add(nextState);
						double nextScore = currScores.get(currState) + transitions.get(currState).get(nextState);
					
						if(observationCount.get(nextState).containsKey(obs[k])) {
							nextScore += observationCount.get(nextState).get(obs[k]);
							}
						else { // subtract penalty for any observation that hasn't been seen
							nextScore -= PENALTY;
						}

						if(!(nextScores.containsKey(nextState)) || nextScore > nextScores.get(nextState)) {
							nextScores.put(nextState,nextScore);
							backtrack.get(k).put(nextState, currState);	
						}
						
					}
				}
			}
			
			// update the current states and scores 
			currStates = nextStates;
			currScores = nextScores;
		}
		
		
		String HighestEndState = currStates.iterator().next();
		
		// find the best end state, from the last observation 
		for (String current : currScores.keySet()) {
			if(currScores.get(current) > currScores.get(HighestEndState)) {
				 HighestEndState = current;
			}	
		}
		
		String curr = HighestEndState;
		
		String[] viterbi = new String[obs.length];
		
		for(int i = obs.length-1;i >=0;i--) {
			viterbi[i]=curr;
			viterbiTags.add(0,curr);
			curr = backtrack.get(i).get(curr);
		}

		return viterbiTags;
	}
	
	/**
	 * tests the performance of predictions, given Test Tags and Test Sentences
	 */
	public void performanceAccuracy() {
		
		try {
			partOfSpeechReader = new BufferedReader(new FileReader(testTags));
			sentenceReader = new BufferedReader(new FileReader(testSentence));
			
			String POStag, sentence;
			double wrongs = 0;
			double rights= 0;
			double total =0;
			
			while((POStag = partOfSpeechReader.readLine()) != null && (sentence = sentenceReader.readLine()) != null){
			
				String[] partsOfSpeech = POStag.split(" "); 
				ArrayList<String> myTags = Viterbi(sentence);
				
				
				if(myTags.size() != partsOfSpeech.length) {
					System.out.println("Number of Part of speech predictions do not match number of words");
				}
				else {
					for(int i =0;i<partsOfSpeech.length;i++) {
						System.out.println("Expected POS: "+ partsOfSpeech[i] + " ----->  Prediction : " + myTags.get(i) );
						
						if(partsOfSpeech[i].equals(myTags.get(i))) {
							rights+=1;
							total += 1;
						}
						else {
							wrongs+=1;
							total+=1;
						}
					}
				}
				
			}
			System.out.println("Number of right predictions: " + rights );
			System.out.println("Number of incorrect predictions: " + wrongs);
			
			System.out.println("Prediction accuracy: " + rights * 100/total + " %" + "\n");

		}
		catch (Exception e) {
			System.out.println("Could not open file"+ e);
		}
		finally {
			try {
				partOfSpeechReader.close();
				sentenceReader.close();
			}catch(IOException e) {
				System.out.println("Could not close files" +e);
			}
		}
	}
	
	
	/**
	 * predicts parts of speech based on the text-input from user
	 */
	public void consoleBasedTest() {
		Scanner in = new Scanner(System.in);  // scanner to receive user input
		
		while(true) {
			
			System.out.println("Type your text input here :");
			
			String userText = in.nextLine().toLowerCase();// convert user input to lower case
			String[] text = userText.split(" ");
			
			
			
			try {
				ArrayList<String> myTags = Viterbi(userText); // run viterbi on user input
				
				if(text.length !=myTags.size()) {
					System.out.println("Number of predictions do not match number of words");
				}
				else {
					for(int i =0; i< text.length;i++) {
						System.out.println("word :  "+ text[i] + " ----->  Predicted part of speech " + myTags.get(i) );	
					}
				}
			}catch(Exception e) {
				System.out.println("Error: Problem running vertebi on your input ");
			}
			System.out.println("\nConsole ready to receive new sentence for processing...");			
		}	
	}
	
	
	public static void main(String[] args) {
		Training train = new Training();
		train.consoleBasedTest();
	}

}
