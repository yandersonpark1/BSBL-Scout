import pandas as pd 
import plotly.express as px
from data_visual import ScatterPlot


#Changeup will need to use Deviations Based on Fastball
    #creates File for only changeup data for Rapsodo#
        #Changeup Profiles 
            #Avg Deviations - Velo (8mph), VB (8 in), HB (3.5 in) 
            #Velocity Deviation; <6: Firm, 6-9: Standard, > 9: Parachute 
                #Firm and Standard GB; Parachute Whiffs
            #VB Deviation; <= 5: Copycat, 5-10: Standard, > 10: Dropper
                #Firm Droppers (GB)
                #Parachute Dropper - Airbender 
                    # Seam orientation typically around 2:30 or more 
                #Typically with big VB deviations also comes high HB deviations
            #HB Deviation; <6: Standard, >=6 Shuuto
        #Notes 
            #Typically Changeups with 4Seam FBs will grade Higher 
            #Changeup with 2S/Sinkers FBs will grade lower
            #Firm Copycats should be avoided
            #Either two categories should be elite or one should be elite and the other should be standard
            #BugsBunny Changeup: Changeup with >9 mph difference with standard and copycat mvmt (plays well)
    