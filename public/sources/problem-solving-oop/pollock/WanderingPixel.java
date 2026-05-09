import java.awt.*;

/**
 * A blob that moves randomly and has a color
 */
public class WanderingPixel extends Wanderer {
	private Color color; int Maxv = 16777216;
	
	public WanderingPixel(double x, double y, double r, Color c) {
		super(x, y, r);
		this.color = c;
		c.getRGB();
		
	}
	public Color getColor() {
		return color;
	}
	
	
	@Override
	public void draw(Graphics g) {
		g.setColor(color);
		g.fillOval((int)(x-r), (int)(y-r), (int)(2*r), (int)(2*r));
	}
}
