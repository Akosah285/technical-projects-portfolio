/**
 * @authors Sylvester E. Coch , Akwasi D. Akosah
 * CS 10, winter 2019 PS_3
 * Compresses a given original text file, and decompresses the compressed file
 * Relies on Huffman Encoding for compression
 */

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;

public class CompressFile {
	private String fileName ;                        // filename of the file to be compressed
	private HuffmanTree<Character> HuffmanCodeTree;  // contains unique code for each letter
	private BufferedReader input;                    // file for compressing
	private BufferedWriter output;                   // compressed file
	private Map<Character, Integer> frequencyMap;    // frequency map; Characters -> count
	private PriorityQueue<HuffmanTree<Character>> sortedCharacters; // Characters -> sorted frequencies	
	private Map<Character, String> codeMap;          // characters and their huffMan codes
	
	/**
	 * Constructor, sets up both compressor and decompressor 
	 * Output - both compressed and decompressed files
	 * @param fileName , file to be compressed
	 */
	
	public CompressFile(String fileName) {
		this.fileName = fileName;
		
		// Open the file, if possible
        try {
    		input = new BufferedReader(new FileReader(fileName));
        } 
        catch (FileNotFoundException e) {
            System.err.println("Cannot open file.\n" + e.getMessage());    
        }
        
        // try compressor and decompressor set-up
        
        try {
        	generateFrequencyTable();
    		sortFrequency();
    		CreateHuffmanCodeTree();
    		codeMap = buildCodeMap(HuffmanCodeTree);
    		compressText();
    		decompressText();     // comment out decompressText to only carry out compression part
    		System.out.println("compressor set up works");
    		System.out.println("decompressor works");
        }
        catch(Exception e) {
        	System.out.println(e + " There was an error in compressor set-up");
        }
        
	}
	
	/**
	 * create frequency map of all the characters in the file
	 *  
	 */
	public void generateFrequencyTable() {
		frequencyMap = new HashMap<Character, Integer>();
		
        // Try Reading the file
		try {
			// Line by line, then character by character
			int character;
			int lineNum = 0;
			while ((character = input.read()) != -1) {
			
				try {
					 Character letter = (char) character; 	
					 
					 	// if this character has already been seen, update its frequency
					 	if (frequencyMap. containsKey(letter)) {
						 frequencyMap.put(letter, frequencyMap.get(letter) + 1); 
					 	}
					 	// it's the first time seeing this letter, place in map
					 	else {frequencyMap.put(letter, 1);	
					 	}	 
				}catch (Exception e) {
						System.err.println(e + " bad number in line "+lineNum+":"+character);
					}
				
				lineNum++;
			}
			System.out.println("This is the frequencey Map " + frequencyMap + "\n");
		}
		catch (IOException e) {
			System.err.println("IO error while reading.\n" + e.getMessage());
		}

		// Close the file, if possible
		try {
			input.close();
		}
		catch (IOException e) {
			System.err.println("Cannot close file.\n" + e.getMessage());
		}
		
	}
	
	/**
	 * sorts the map entries with character -> count pairs using a priority queue
	 * 
	 */
	public void sortFrequency(){
		// Lambda function used to prioritize, rank based on frequencies
		sortedCharacters = new PriorityQueue<HuffmanTree<Character>>((HuffmanTree<Character> h1, HuffmanTree<Character> h2) -> h1.frequency - h2.frequency  );
		
		if(sortedCharacters.size() < 1) { // this handles the boundary case of an empty file.
			HuffmanTree<Character> dummy1 = new HuffmanTree<Character>('C', 0);
			sortedCharacters.add(dummy1);
		}
	
		for (Character key : frequencyMap.keySet()) {
		
			// create a new HuffmanTree with the letter and frequency
			HuffmanTree<Character> treeEntry = new HuffmanTree<Character>(key, frequencyMap.get(key)); 
			sortedCharacters.add(treeEntry); // add tree back to priority queue
			}		
		}
	
	/**
	 * Builds the HuffmanCodeTree using the sorted items from the priority queue
	 */
	public void CreateHuffmanCodeTree() {
		
		while ( sortedCharacters.size() != 1) { 
			HuffmanTree<Character> t1 = sortedCharacters.remove(); // remove the character with the least frequency
			HuffmanTree<Character> t2 = sortedCharacters.remove(); // remove the character with the second least frequency
			Integer total = t1.getFrequency() + t2.getFrequency(); // sum their total frequencies
			
			// insert a new Huffman tree with left and right children, and total frequencies into priority queue
			sortedCharacters.add(new HuffmanTree<Character>(t1, t2, total));
		}
		
		// done building, last tree is the HuffmanCode Tree
		HuffmanCodeTree = sortedCharacters.remove();
		
		// Print huffmanCode Tree
        // System.out.println(HuffmanCodeTree);  //Uncomment to print HuffmanCodeTree
	}
	
	/**
	 * Maps each character to a string code: 
	 * Character -> Code
	 */
	public Map<Character, String> buildCodeMap(HuffmanTree<Character> tree){
		 Map<Character, String> c = new HashMap<Character, String>();
		 String code =  "";
		 codeBuilder(c, tree, code);
		 System.out.println("This is the code map " + c + "\n");
		 return c;
	}
	
	/**
	 * Helper method, for building Code Map
	 * @param c, code map
	 * @param tree,  huffmancode tree
	 * @param code, code as string 
	 */
	public void codeBuilder(Map<Character, String> c, HuffmanTree< Character> tree, String code) {
		
		if (tree.hasLeft()) {
			if (tree.getLeft().isLeaf()){
				c.put(tree.getLeft().getData(), code + "0" );
			}else {
				codeBuilder(c, tree.getLeft(), code + "0");
			}
		}
		
		if (tree.hasRight()) {
			if (tree.getRight().isLeaf()){
				c.put(tree.getRight().getData(), code + "1");
			}else {
				codeBuilder(c, tree.getRight(), code + "1");
			}
			
		}
	}
	
	/**
	 * compresses the textfile into with filename_compressed.txt
	 * @throws IOException if file cannot be opened
	 */
	public void compressText() throws IOException {
		input = new BufferedReader(new FileReader(fileName));
		BufferedBitWriter bitWriter = new BufferedBitWriter(fileName.substring(0, fileName.indexOf('.')) + "_compressed.txt");
		
		int c;
		int count = 0;
		while ((c = input.read()) != -1) {
		  char currentChar = (char) c;
		  String code = codeMap.get(currentChar);
		  
		  if (code != null) {
			  count ++;
		
			  for (char bit : code.toCharArray()) {
				  
				  if (bit == '0') {
				  bitWriter.writeBit(false); // write bit 0
				 
				  }
				  else if (bit == '1') {
				  bitWriter.writeBit(true);	 // write bit 1 
				  }
			  }
			 
		  }
		}
		//System.out.println("num bits " + count); //uncomment to find number of bits written
		try{
			bitWriter.close();
			input.close();
		}catch(Exception e) {
			System.out.println("Error occured while closing files " + e);
		}
	}

	 /**
	  * decompresses textfile into filename_decompressed.txt
	  * @throws IOException if there's a problem with opening files
	  */
	 
	public void decompressText()throws IOException{
		BufferedBitReader bitReader = new BufferedBitReader(fileName.substring(0, fileName.indexOf('.')) + "_compressed.txt");
		output = new BufferedWriter(new FileWriter(fileName.substring(0, fileName.indexOf('.')) + "_decompressed.txt"));
		int count = 0;
		HuffmanTree<Character> character = HuffmanCodeTree;
		
		while (bitReader.hasNext()) { 
			count ++;
			boolean bit = bitReader.readBit();
			
			if( bit == false) {
				character = character.getLeft(); // if bit is 0 , traverse left

			}
		    if( bit == true){
				character = character.getRight();// if bit is 1, traverse right

			}	
			if (character.isLeaf()) {
				output.write(character.getData());	// once we hit a leaf, get character and write to decompressed file
				
				// set character back to root
				character = HuffmanCodeTree;
			}	
		}
		//System.out.println(count); // how many bits have been read?
		try {
			bitReader.close(); 
			output.close();
		}catch(Exception e) {
			System.out.println("Error occured while closing files " + e);
			}
	}
	
	public static void main(String[] args) {
		String pathName = "inputs/USConstitution.txt";   // type in the filename of the file to compress and decompress
		CompressFile compressor = new CompressFile(pathName);	// constructor does both compressing and decompressing	
	}
}


