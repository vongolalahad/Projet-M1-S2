const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const fs = require('fs')

const Sensor = require('./Sensor')

module.exports  = class ArduinoSensors  {
    start(config, config_sensor, timestamp) {

    }
}