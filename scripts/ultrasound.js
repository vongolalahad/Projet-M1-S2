"use strict"

const ultrasound_config = require('../config/ultrasound')
const fs = require('fs')
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength

const port = new SerialPort("/dev/ttyUSB0", { baudRate: ultrasound_config.baudRate })
const stm_ultra_port = port.pipe(new Ready({ delimiter: new Buffer([0x04, 0x01]) })).pipe(new ByteLength({ length: 20 }))

stm_ultra_port.on('data', (data) => {
    fs.appendFile(`test`, data, (err) => {
        if (err) console.log(err)
    })
    console.log(data)
})