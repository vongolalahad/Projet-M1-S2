"use strict"

const fs = require('fs')
const arduino_config = require('../config/arduino')
const stm_ir_config = require('../config/stm32_IR')
const ultrasound_config = require('../config/ultrasound')
const SerialPort = require('serialport')
const colors = require("colors")
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const port = new SerialPort("/dev/ttyACM0", { baudRate: stm_ir_config.baudRate })

const stm_ir_port = port.pipe(new Ready({ delimiter: '\n\r' })).pipe(new Readline({ delimiter: '\n\r' }))
//const stm_ultrasound_port = new SerialPort(ultrasound_config.port, { baudRate: ultrasound_config.baudRate })
//const arduino_port = new SerialPort(arduino_config.port, { baudRate: arduino_config.baudRate })

/**
 * List default parameter of the program
 */
function list_default_parameter() {
    console.log(colors.red("\n==================== Default parameter ====================\n"))
    console.log("=====> Arduino config")

}

function main() {
    list_default_parameter()
    stm_ir_port.on('data', (data) => {
        let count = data.toString().split(',').length
        if (count !== 4) return
        data += "\n"
        fs.appendFile(`test.csv`, data.toString(), (err) => {
            if (err) console.log(err)
        })
    })
}

main()

/*    arduino_port.on('data', (data) => {
        fs.appendFile(`${arduino_config["data repository"]}/test.csv`, data.toString(), (err) => {
            if (err) console.log(err)
        })
    })*/