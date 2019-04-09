const fs = require('fs')
const arduino_config = require('./config/arduino')
const stm_ir_config = require('./config/stm32_IR')
const stm_ultrasound_config = require('./config/stm32_ultrasound')
const SerialPort = require('serialport')

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

const stm_ir_port = new SerialPort(stm_ir_config.port, { baudRate: stm_ir_config.baudRate })
const stm_ultrasound_port = new SerialPort(stm_ultrasound_config.port, { baudRate: stm_ultrasound_config.baudRate })
const arduino_port = new SerialPort(arduino_config.port, { baudRate: arduino_config.baudRate })

stm_ir_port.on('data', (data) => {
    fs.appendFile(`${stm_ir_config.data_rep}/test.csv`, data.toString(), (err) => {
        if (err) console.log(err)
    })
})

arduino_port.on('data', (data) => {
    fs.appendFile(`${arduino_config.data_rep}/test.csv`, data.toString(), (err) => {
        if (err) console.log(err)
    })
})