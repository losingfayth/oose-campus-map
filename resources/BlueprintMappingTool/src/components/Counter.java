package components;

public class Counter {
    int v;
    public Counter(int init) {
        v = init;
    }
    public void increment() {
        v++;
    }
    public void decrement() {
        v--;
    }
    public int getValue() {
        return v;
    }
}
