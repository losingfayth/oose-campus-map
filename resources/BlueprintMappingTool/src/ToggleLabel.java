import javafx.scene.control.ToggleButton;
import javafx.scene.paint.Color;

public class ToggleLabel extends ToggleButton
{
    private final Color color;

    public ToggleLabel(String label, Color color) {
        super(label);
        this.color = color;
    }

    public Color getColor()
    {
        return color;
    }
}
