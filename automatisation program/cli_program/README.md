# Projet-M1-S2
Caractérisation et mise en place d'une interface d'un capteur

**Operation of the application in CLI mode**

- let the default config or set the environment to use (fix the color and change the value of the temperature)
- 
**Architecture of the project:**

    |--- config             # contain configuration files (json file)
    |    |--- arduino.json
    |    |--- stm32.json
    |
    |--- data               # data receive by sensors
    |    |--- arduino       # directory containing data coming from sensors connected to the arduino
    |    |--- stm32         # directory containing data coming from sensors connected to the stm32
    |
    |--- tests              # testing the code
    |--- scripts            # standalone scripts for dev uses
    |--- app.js             # App starting point
    |--- appGui.js          # graphical application of the project