import pandas as pd
from fastball_module import ClassifyFastball
from slider_module import ClassifySlider
from changeup_module import ClassifyChangeup

# Load CSV data
df = pd.read_csv("your_data.csv")

def format_pitch_summary(pitch_type, velocity, classification):
    return f"{pitch_type} at {velocity:.1f} mph ({classification})"

all_summaries = {}

# --- Fastballs ---
fb_classifier = ClassifyFastball(df)
fastball_results = fb_classifier.classify_all()
fastball_avg = fb_classifier.classify_average()

fastball_summaries = [
    format_pitch_summary(res['pitch_type'], res['velocity'], res['classification'])
    for res in fastball_results
]
fastball_summaries.append(
    f"Average Fastball: {fastball_avg['pitch_type']} at {fastball_avg['velocity']:.1f} mph ({fastball_avg['classification']})"
)
all_summaries['Fastballs'] = fastball_summaries

# --- Sliders ---
sl_classifier = ClassifySlider(df)
slider_results = sl_classifier.sliderFile()
slider_avg = sl_classifier.sliderAverage()

slider_summaries = [
    format_pitch_summary(res['pitch_type'], res['velocity'], res['classification'])
    for res in slider_results
]
slider_summaries.append(
    f"Average Slider: {slider_avg['pitch_type']} at {slider_avg['velocity']:.1f} mph ({slider_avg['classification']})"
)
all_summaries['Sliders'] = slider_summaries

# --- Changeups ---
ch_classifier = ClassifyChangeup(df)
changeup_results = ch_classifier.changeupFile()
changeup_avg = ch_classifier.changeupAverage()

changeup_summaries = [
    format_pitch_summary(res['pitch_type'], res['velocity'], res['classification'])
    for res in changeup_results
]
changeup_summaries.append(
    f"Average Changeup: {changeup_avg['pitch_type']} at {changeup_avg['velocity']:.1f} mph ({changeup_avg['classification']})"
)
all_summaries['Changeups'] = changeup_summaries

# --- Output ---
for pitch_type, summaries in all_summaries.items():
    print(f"--- {pitch_type} ---")
    for s in summaries:
        print(s)
    print("\n")
