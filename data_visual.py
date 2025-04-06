import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px

# Load the CSV
file = input("Enter the file name (with .csv extension): ")  # change this if the file is named differently
df = pd.read_csv(file)

# Extract and clean the relevant columns

#Creates copy of dataframe 
df_pitchPlot = df[["Pitch Type", "VB (trajectory)", "HB (trajectory)"]].copy()
#removes any non-numeric values and any misread pitches
df_pitchPlot[["VB (trajectory)", "HB (trajectory)"]] = df_pitchPlot[["VB (trajectory)", "HB (trajectory)"]].apply(pd.to_numeric, errors='coerce').dropna()
df_pitchPlot = df_pitchPlot[(df_pitchPlot["VB (trajectory)"].between(-30, 30)) & (df_pitchPlot["HB (trajectory)"].between(-30,30))]
# Sort by VB while keeping HB aligned
df_pitchPlot = df_pitchPlot.sort_values(by="VB (trajectory)", ascending=True)

#makes scatterplot
bsblPlot = px.scatter(
    df_pitchPlot,
    x="HB (trajectory)",
    y="VB (trajectory)",
    color="Pitch Type",
    hover_data=["Pitch Type"],
    title="Pitch Movement Scatter Plot",
    labels={
        "HB (trajectory)": "Horizontal Break (in)",
        "VB (trajectory)": "Vertical Break (in)"
    }
)

# Customize axis lines like in matplotlib
bsblPlot.update_layout(
    xaxis=dict(range=[-30, 30], zeroline=True, zerolinewidth=2, zerolinecolor='black'),
    yaxis=dict(range=[-30, 30], zeroline=True, zerolinewidth=2, zerolinecolor='black'),
    width=800,
    height=800
)

print(df_pitchPlot.head(100))
bsblPlot.show()

# Plot using MatPlotlib
# plt.figure(figsize=(8, 8))
# plt.xlim(-30, 30)
# plt.ylim(-30, 30)
# plt.axhline(0, color='black', lw=1)
# plt.axvline(0, color='black', lw=1)

# plt.scatter(df_pitchPlot["HB (trajectory)"], df_pitchPlot["VB (trajectory)"], alpha=0.7)

# plt.title('Pitch Movement Chart')
# plt.xlabel('Horizontal Break (inches)')
# plt.ylabel('Induced Vertical Break (inches)')
# plt.grid(True)
# plt.tight_layout()
# plt.show()
# print(df_pitchPlot[["VB (trajectory)", "HB (trajectory)"]].head(100))
