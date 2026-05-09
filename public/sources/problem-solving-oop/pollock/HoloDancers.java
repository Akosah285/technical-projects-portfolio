/**
 * Creates Hologram of a Friend performing a Dance.
 * @author Akwasi Akosah , CS 10, Winter 19
 *
 */
public class HoloDancers {
	String name;  // Name of Hologram
		

	public String NigerianDance() {
		return "Shaku-Shaku";	// name of dance to perform	
	}
	
	
	
	
	public static void main(String[] args) {
		HoloDancers Edward = new HoloDancers();
		System.out.println("Edward" +" dances " + 
		Edward.NigerianDance());
		

	}

}
