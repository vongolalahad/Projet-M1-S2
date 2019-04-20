/**
 *
 *
 */

'use strict'
const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength
const fs = require('fs')
let Progress = require('progress')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

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
    async start(config, config_sensor, test_env, env, timestamp) {
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

        const csvWriter = createCsvWriter({
            path: `${config_sensor["data repository"]}/InfraRed_${timestamp}_${test_env.toVary}${env.temperature}.csv`,
            header: [
                {id: 'timestamp', title: 'TIMESTAMP'},
                {id: 'timestamp_field', title: 'TIMESTAMP FIELD'},
                {id: 'sensor', title: 'Sensor'},
                {id: 'status', title: 'STATUS'},
                {id: 'distance', title: 'DISTANCE'}
            ]
        })
        const records = []
        await csvWriter.writeRecords(records)

        this.parser.on('data', (data) => {
            data = data.slice(0, data.length - 2)
            data = Buffer.concat([new Buffer(Date.now().toString()), new Buffer([0x2c]), data, new Buffer([0x0a])])
            if (UltrasoundSensor.count_occurrence(data) !== 4) return
            fs.appendFile(`${config_sensor["data repository"]}/Ultrasound_${timestamp}_${test_env.toVary}${ Sensor.getValue(test_env, env) }.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x04, 0x01]) })).pipe(new ByteLength({ length: 20 }))
    }

}