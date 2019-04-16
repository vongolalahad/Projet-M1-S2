const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength
const fs = require('fs')
let Progress = require('progress')

const Sensor = require('./Sensor')

module.exports = class UltrasoundSensor extends Sensor{

    constructor(path, config, type) {
        super(path, config, type)
    }

    static count_occurrence(buff) {
        let count = 0
        for (const value of buff.values()) {
            if (value === 0x2c)
                count++
        }
        return count
    }

    // Start the measurement (open the port, add data in csv file)
    async start(config, config_sensor, test_env, env, timestamp, arduino_sensors) {
        console.log(config)
        console.log(config_sensor)
        console.log(test_env)
        console.log(env)
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }
        this.port.open(err => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
        })

        this.parser.on('data', (data) => {
            data = data.slice(0, data.length - 2)
            data = Buffer.concat([new Buffer(Date.now().toString()), new Buffer([0x2c]), data, new Buffer([0x0a])])
            //console.log(UltrasoundSensor.count_occurrence(data))
            if (UltrasoundSensor.count_occurrence(data) !== 4) return
            // Start measurement algorithm
            //....
            console.log(colors.white(`\nYou have ${config.timeout} seconds to change the ${test_env.toVary} to ${test_env.toVary === "temperature" ? env.temperature : env.color }. If not, the test will stop!`))
            /*let bar = new Progress('[:bar] :current secs/:total', {total: config.timeout})
            let timer = setInterval(() => {
                bar.tick()
                if (bar.complete) {
                    clearInterval(timer)
                }
            }, 1000)
            let checking = setInterval(() => {

            }, 1000)*/
            fs.appendFile(`${config_sensor.data_rep}/Ultrasound_${timestamp}_${test_env.toVary}${test_env.toVary === "temperature" ? env.temperature : env.color }.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x04, 0x01]) })).pipe(new ByteLength({ length: 20 }))
    }

}