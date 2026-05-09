/**
 * A blob that moves randomly after several steps
 * @author Akwasi Akosah
 *
 */

public class PurposeWanderer extends Blob{
	
	int numberOfSteps;
	int stepsTaken;
	int MaxSteps;
	int MinSteps;
	
	public PurposeWanderer(int x, int y) {
		super(x,y);
	}
	
	public int setNumberOfSteps() {
		
		int MaxSteps = 20;
		int MinSteps = 10;
		return numberOfSteps = (int)(Math.random()*(MaxSteps-MinSteps )+MinSteps);
	}
	
	@Override
	public void step() {
		
		if(stepsTaken == numberOfSteps) {
			dy = 10 * Math.random();
			dx = 10 * Math.random();
			y += dy;
			x += dx;
		}
		
		else {
			dy = 3;
			dx = 2;
			y += dy;
			x += dx;
			stepsTaken += 1;
			
		}
	}
	

	public static void main(String[] args) {
		
		PurposeWanderer Puwa1 = new PurposeWanderer(3,4);
		System.out.println(Puwa1.setNumberOfSteps());
		Puwa1.step();
		System.out.println(Puwa1.dx);
		System.out.println(Puwa1.dy);
		Puwa1.step();
		Puwa1.step();
		System.out.println(Puwa1.stepsTaken);
		Puwa1.step();
		System.out.println(Puwa1.dx);
		System.out.println(Puwa1.dy);
		
		/**
		 *  Can test that dx and dy changes by setting range of random step to a small
		 *  ranges of MaxSteps and MinSteps eg. 2 and 4
		 *   
		 */
		
		

	}

}
