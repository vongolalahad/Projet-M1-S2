const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const fs = require('fs')

const Sensor = require('./Sensor')

module.exports  = class IRSensor extends Sensor {

    constructor(path, config) {
        super(path, config)
    }

    // Start the measurement (open the port, add data in csv file)
    start(config, config_sensor, test_env, env, timestamp) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }
        this.port.open((err) => {
            if (err) {
                console.error(`The serial port defined (${this.path}) doesn't exist!`)
                process.exit(1)
            }
        })

        this.parser.on('data', (data) => {
            let count = data.toString().split(',').length
            if (count !== 4) return
            // Add the timestamp in the data
            //......
            data += "\n"
            // Start measurement algorithm (while tem != ...)
            //......
            fs.appendFile(`${config_sensor.data_rep}/InfraRed_${timestamp}_temperature${env.temperature}.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: '\n\r' })).pipe(new Readline({ delimiter: '\n\r' }))
    }
}