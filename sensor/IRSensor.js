const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const fs = require('fs')
const Progress = require('progress')

const Sensor = require('./Sensor')

module.exports  = class IRSensor extends Sensor {

    constructor(path, config, type) {
        super(path, config, type)
    }

    // Start the measurement (open the port, add data in csv file)
    async start(config, config_sensor, test_env, env, timestamp, arduino_sensor) {
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
                console.error(err)
                process.exit(1)
            }
        })

        this.parser.on('data', (data) => {
            data = Date.now() + ", " + data
            let count = data.toString().split(',').length
            if (count !== 5) return
            data += "\n"
            // Start measurement algorithm (while tem != ...)
            //......
            console.log(colors.white(`\nYou have ${config.timeout} seconds to change the ${test_env.toVary} to ${test_env.toVary === "temperature" ? env.temperature : env.color }. If not, the test will stop!`))
            let bar = new Progress('[:bar] :current secs/:total', {total: config.timeout})
            let timer = setInterval(() => {
                bar.tick()
                if (bar.complete) {
                    clearInterval(timer)
                }
            }, 1000)
            let checking = setInterval(() => {

            }, 1000)
            fs.appendFile(`${config_sensor.data_rep}/InfraRed_${timestamp}_${test_env.toVary}${env.temperature}.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: '\n\r' })).pipe(new Readline({ delimiter: '\n\r' }))
    }
}
