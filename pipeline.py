from clean_data import main as clean_data 
from ClassifyFastball import main as run_fastball
from ClassifyChangeup import main as run_changeup
from ClassifySlider import main as run_slider

def pipeline(folder_path = None, player_name = None): 
    print("Starting data cleaning...")
    cleaned_dfs = clean_data(folder_path, player_name)
    print(f"\nProcessing file: {cleaned_dfs}")
    
    
    for df in cleaned_dfs:
        print("\nStep 2: Fastball analysis...")
        fastball_results = run_fastball(df)

        print("\nStep 3: Changeup analysis...")
        changeup_results = run_changeup(df)

        print("\nStep 4: Slider analysis...")
        slider_results = run_slider(df)


    print("\nPipeline complete ✅")


def main(): 
    folder = input("Enter the path to the Rapsodo CSV file or directory: ").strip()
    player = input("Enter the player name: ").strip()
    final_results = pipeline(folder, player)

if __name__ == "__main__":
    main()