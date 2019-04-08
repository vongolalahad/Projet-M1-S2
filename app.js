const fs = require('fs')
const arduino_config = require('./config/arduino')
const stm_config = require('./config/stm32')
const SerialPort = require('serialport')

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

const stm_port = new SerialPort(stm_config.port, { baudRate: stm_config.baudRate })
const arduino_port = new SerialPort(arduino_config.port, { baudRate: arduino_config.baudRate })

stm_port.on('data', (data) => {
    fs.appendFile(`${stm_config.data_rep}/test.csv`, data.toString(), (err, data) => {
        if (err) console.log(err)
        console.log(data)
    })
})

arduino_port.on('data', (data) => {
    fs.appendFile(`${arduino_config.data_rep}/test.csv`, data.toString(), (err, data) => {
        if (err) console.log(err)
        console.log(data)
    })
})