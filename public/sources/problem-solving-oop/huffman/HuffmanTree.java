

/**
 *@author Sylvester E. Coch , Akwasi D. Akosah 
 *CS10, Winter 2019 , February 10 , 2019 
 *modified from binaryTreeCode for problem set 3 
 */
public class HuffmanTree<E> {
	private HuffmanTree<E> left, right;	// children; can be null
	E data;                             // for PS_3 will be a character
	int frequency = 0;                  // counts the number of times a character appears in textfile
	
	/**
	 * Constructs leaf node with a frequency -- left and right are null
	 *  
	 */
	public HuffmanTree(E data, int frequency) {
		this.data = data; this.left = null; this.right = null; this.frequency = frequency;
	}

	/**
	 * Constructs inner node with a total frequency of the left and right nodes
	 * Inner node need not have any data
	 */
	public HuffmanTree( HuffmanTree<E> left, HuffmanTree<E> right, int frequency) {
		this.data = null; this.left = left; this.right = right; this.frequency = frequency; 
	}
	
	
	public void traverse() {
		System.out.println(data);
		if (hasLeft()) left.traverse(); // recursively traverse the left of a tree
		if (hasRight()) right.traverse(); // recursively traverse the right of a tree
	}

	/**
	 * Is it an inner node?
	 */
	public boolean isInner() {
		return left != null || right != null;
	}

	/**
	 * Is it a leaf node?
	 */
	public boolean isLeaf() {
		return left == null && right == null;
	}

	/**
	 * Does it have a left child?
	 */
	public boolean hasLeft() {
		return left != null;
	}

	/**
	 * Does it have a right child?
	 */
	public boolean hasRight() {
		return right != null;
	}

	public HuffmanTree<E> getLeft() {
		return left;
	}

	public HuffmanTree<E> getRight() {
		return right;
	}

	public E getData() {
		return data;
	}
	
	public int getFrequency() {
		return frequency;
	}
	

	/**
	 * Number of nodes (inner and leaf) in tree
	 */
	public int size() {
		int num = 1;
		if (hasLeft()) num += left.size();
		if (hasRight()) num += right.size();
		return num;
	}

	/**
	 * Longest length to a leaf node from here
	 */
	public int height() {
		if (isLeaf()) return 0;
		int h = 0;
		if (hasLeft()) h = Math.max(h, left.height());
		if (hasRight()) h = Math.max(h, right.height());
		return h+1;						// inner: one higher than highest child
	}	
	
	/**
	 * Returns a string representation of the Huffmantree
	 */
	public String toString() {
		return toStringHelper("");
	}

	/**
	 * Recursively constructs a String representation of the tree from this node, 
	 * starting with the given indentation and indenting further going down the tree
	 */
	public String toStringHelper(String indent) {
		String res = indent + data + "\n";
		if (data == null) res = indent + frequency + "\n";
		if (hasLeft()) res += left.toStringHelper(indent+"  ");
		if (hasRight()) res += right.toStringHelper(indent+"  ");
		return res;
	}

}
