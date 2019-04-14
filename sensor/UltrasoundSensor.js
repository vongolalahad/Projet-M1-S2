const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const fs = require('fs')

const Sensor = require('./Sensor')

module.exports = class UltrasoundSensor extends Sensor{

    constructor(path, config) {
        super(path, config)
    }

    // Start the measurement (open the port, add data in csv file)
    start(config, config_sensor, env, timestamp) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }
        this.port.open()
        this.parser.on('data', (data) => {
            let count = data.toString().split(',').length
            if (count !== 4) return
            data += "\n"
            fs.appendFile(`${config_sensor.data_rep}/test.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    stop() {

    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: '\n\r' })).pipe(new Readline({ delimiter: '\n\r' }))
    }

}