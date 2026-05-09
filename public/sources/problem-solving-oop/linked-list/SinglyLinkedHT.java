/**
 * A singly-linked list implementation of the SimpleList interface
 * Now with tail pointer
 * 
 * @author Chris Bailey-Kellogg, Dartmouth CS 10, Fall 2012, 
 * based on a more feature-ful version by Tom Cormen and Scot Drysdale
 * @author CBK, Spring 2016, cleaned up inner class, extended testing
 */
public class SinglyLinkedHT<T> implements SimpleList<T> {
	private Element head;	// front of the linked list
	private Element tail;	// end
	private int size;		// # elements in the list
	 

	/**
	 * The linked elements in the list: each has a piece of data and a next pointer
	 */
	private class Element {
		private T data;
		private Element next;

		private Element(T data, Element next) {
			this.data = data;
			this.next = next;
		}
	}

	public SinglyLinkedHT() {
		// TODO: this is just copied from SinglyLinked; modify as needed
		head = null;
		tail = null;
		size = 0;
	}

	public int size() {
		return size;
	}

	/**
	 * Helper function, advancing to the nth Element in the list and returning it
	 * (exception if not that many elements)
	 */
	private Element advance(int n) throws Exception {
		Element e = head;
		while (n > 0) {
			// Just follow the next pointers
			if(e.next != null) {
				e = e.next;
			}
			
			if (e == null) throw new Exception("invalid index");
			n--;
		}
		return e;
	}

	public void add(int idx, T item) throws Exception {        
		// TODO: this is just copied from SinglyLinked; modify as needed
		if (idx == 0) {
			// Insert at head
			head = new Element(item, head);
			
			if(size() == 0) {
				tail = head;  // set tail to head if they are the first items in list. At this instance size is not update,so equals 0
			}
					
		}
	
		
		else {
			// It's the next thing after element # idx-1
			Element e = advance(idx-1);
			// Splice it in
			e.next = new Element(item, e.next);
			
			// update tail to be the last item in list. Used size to index size it has not been updated yet
			Element oldtail = advance(size());
			tail = oldtail.next;
			
		}
		size++;
	}

	public void remove(int idx) throws Exception {
		// TODO: this is just copied from SinglyLinked; modify as needed
		if (idx == 0) {
			// Just pop off the head
			if (head == null) throw new Exception("invalid index");
			head = head.next;
		}
		
		if (idx >= size()-1) { // if indexed out of range, pop off the last item in list and update tail
			Element e = advance(size()- 2);
			if (e != null) {
				tail = e;
				tail.next = null;
			}		
		}
		
		else {
			// It's the next thing after element # idx-1
			if (idx != 0 && idx < size()-1) {
				Element e = advance(idx-1);
				if (e.next == null) throw new Exception("invalid index");
				// Splice it out
					e.next = e.next.next;
			}
			
		}
		size--; // update size of list
	}

	public T get(int idx) throws Exception {
		Element e = advance(idx);
		return e.data;
	}

	public void set(int idx, T item) throws Exception {
		Element e = advance(idx);
		e.data = item;
	}

	/**
	 * Appends other to the end of this in constant time, by manipulating head/tail pointers
	 * @throws Exception 
	 */
	public void append(SinglyLinkedHT<T> other) {
		// TODO: YOUR CODE HERE
		if (other != null && tail != null) { // check to see if other and tail are not null
			tail.next = other.head;  // update the next pointer of the tail to be the head of the list being appended
		}
		if (head == null) {
			head = other.head;	// if first list is empty, set head of list to that of the list being appended
		}
		
		
		
		
		
	}
	
	public String toString() {
		String result = "";
		for (Element x = head; x != null; x = x.next) 
			result += x.data + "->"; 
		result += "[/]";

		return result;
	}

	public static void main(String[] args) throws Exception {
		SinglyLinkedHT<String> list1 = new SinglyLinkedHT<String>();
		SinglyLinkedHT<String> list2 = new SinglyLinkedHT<String>();
		
		
		System.out.println(list1 + " + " + list2);
		list1.append(list2);
		System.out.println(" = " + list1);
		System.out.println("List is empty");

		list2.add(0, "a");
		System.out.println(list1 + " + " + list2);
		list1.append(list2);
		System.out.println(" = " + list1);
		
		list1.add(1, "b");
		list1.add(2, "c");
		SinglyLinkedHT<String> list3 = new SinglyLinkedHT<String>();
		System.out.println(list1 + " + " + list3);
		list1.append(list3);
		System.out.println(" = " + list1);
		
		SinglyLinkedHT<String> list4 = new SinglyLinkedHT<String>();
		list4.add(0, "z");
		list4.add(0, "y");
		list4.add(0, "x");		
		System.out.println(list1 + " + " + list4);
		list1.append(list4);
		System.out.println(" = " + list1);
		
		list1.remove(5);
		list1.remove(4);
		SinglyLinkedHT<String> list5 = new SinglyLinkedHT<String>();
		list5.add(0, "z");
		list5.add(0, "y");
		System.out.println(list1 + " + " + list5);
		list1.append(list5);
		System.out.println(" = " + list1);
	}
}
