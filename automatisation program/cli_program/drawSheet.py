#!/usr/bin/env python3
# coding: utf-8

import os
import sys

try:
    import numpy as np
except ImportError:
    input("Cannot load module numpy. Press enter to install the package logging or Ctrl+c to quit the program")
    os.system("pip3 install --user numpy")
    import numpy as np
try:
    import matplotlib as mpl
except ImportError:
    input("Cannot load module matplotlib. Press enter to install the package logging or Ctrl+c to quit the program")
    os.system("pip3 install --user matplotlib")
    mpl.use('TkAgg')
try:
    import matplotlib.pyplot as plt
except ImportError as e:
    input("{}. {}.".format(str(e), "Press any key to quit"))
    exit(0)
try:
    import pandas as panda
except ImportError:
    input("Cannot load module pandas. Press enter to install the package logging or Ctrl+c to quit the program")
    os.system("pip3 install --user pandas")
    import pandas as panda
try:
    import pathlib
except ImportError:
    input("Cannot load module pathlib. Press enter to install the package logging or Ctrl+c to quit the program")
    os.system("pip3 install --user pathlib")
    import pathlib
from collections import Counter


def main(data_folder, sheet_folder, sensor):
    print(type(data_folder), type(sheet_folder), sensor.lower())

    # current worked directory
    cwd = pathlib.Path(pathlib.Path.cwd())
    data_folder = cwd.joinpath(data_folder)
    sheet_folder = cwd.joinpath(sheet_folder)

    try:
        iterator = os.scandir(str(data_folder))
        for entry in iterator:
            if entry.is_file() and entry.path.endswith('.csv'):
                print(sensor.lower())
                if sensor.lower() == "ultrasound" or sensor.lower() == "ultra sound":
                    column = 4
                elif sensor.lower() == "infrared" or sensor.lower() == "infra red":
                    column = 2
                else:
                    print("Wrong type of sensor. Exiting...")
                    exit(1)
                drawImage(entry, sheet_folder, column)
    except FileNotFoundError:
        print("The repository doesn't exist. Exiting ...")
        exit(1)


def drawImage(entry, sheet_folder, column):

    df = panda.read_csv(entry.path);
    data = df.values; #conversion datafram to array
    A=data[:,column]; # recuperation data


    cpt = Counter(A); #unique values and occurences
    B=list(cpt); #unique values
    B=np.sort(B); #order by values
    C=[];
    for i in B:
        C.append(cpt[i]);
    #print(cpt);
    #print(B)
    #print(C)
    
    plt.scatter(B, C,  color='black')
    plt.plot(B,C, label="ocurrence")
    plt.xlabel("Distance (mm)")
    plt.ylabel("nb d'occurence")
    if column==2 :
        plt.title('infrarouge test')
    elif column==4 :
        plt.title('ultrason test')
    
    #print(path)
    
    entry_image = entry.name
    entry_image_full_path = str(sheet_folder.joinpath(entry_image)).replace("csv", "png")
    print(entry_image_full_path)
    
    #print(path)
    #print(V)
    
    plt.savefig(entry_image_full_path)
    plt.close()
    plt.clf()
    plt.cla()
    #display plot.png


if __name__ == "__main__":
    
    data_folder = sys.argv[1]
    sheet_folder = sys.argv[2]
    sensor = sys.argv[3]
    
    main(data_folder, sheet_folder, sensor)

    
    


# In[ ]:





# In[91]:


#infraRedImage('InfraRed_1555594399118_colorpink.csv')
#infraRedImage(r'C:\Users\louismkm\Desktop\data\InfraRed_1555594536120_colorpurple.csv')


# In[ ]:




