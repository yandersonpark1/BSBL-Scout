import matplotlib.pyplot as plt
import matplotlib.patches as patches
import textwrap

def add_labeled_rect(ax, x, y, w, h, label, facecolor="lime", edgecolor="green", fontsize=12):
    """Adds a rectangle with centered, wrapped text to the axes."""
    rect = patches.Rectangle((x, y), w, h, linewidth=2, edgecolor=edgecolor, facecolor=facecolor)
    ax.add_patch(rect)
    wrapped_label = "\n".join(textwrap.wrap(label, width=12))
    ax.text(x + w/2, y + h/2, wrapped_label, ha="center", va="center",
            fontsize=fontsize, color="black", weight="bold")

# Create figure with proper size
fig, ax = plt.subplots(figsize=(12, 10))  # width x height in inches

# Add all rectangles
add_labeled_rect(ax, -5, -5, 10, 16, "Gyro Fastball")
add_labeled_rect(ax, -5, 11, 10, 7, "Standard Cutter")
add_labeled_rect(ax, -5, 18, 10, 12, "Riding Cutter")
add_labeled_rect(ax, 5, -5, 4, 20, "Ineffic. Fastball", facecolor="salmon", edgecolor="red")
add_labeled_rect(ax, 9, -5, 9, 16, "Ineffic./   Deadzone Fastball", facecolor="salmon", edgecolor="red")
add_labeled_rect(ax, 5, 11, 13, 7, "Deadzone", facecolor="salmon", edgecolor="red")
add_labeled_rect(ax, 5, 18, 13, 12, "Riders")
add_labeled_rect(ax, 18, 18, 12, 12, "Rider-Runners")
add_labeled_rect(ax, 18, 11, 12, 7, "Runners")
add_labeled_rect(ax, 18, -5, 12, 16, "Sinkers")

# Axes settings
ax.set_xlim(-5, 30)
ax.set_ylim(-5, 30)
ax.set_aspect("equal", "box")
ax.set_xlabel("Horizontal Break (HB)", fontsize=14)
ax.set_ylabel("Vertical Break (VB)", fontsize=14)
plt.title("Fastball Classification Chart\n(HB vs VB)", fontsize=16, weight="bold")

# Save PDF with proper DPI and tight layout
plt.tight_layout()
plt.savefig("ClassifyFastball.pdf", dpi=300, bbox_inches="tight")
plt.close()