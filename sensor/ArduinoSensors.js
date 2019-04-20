/**
 *
 */

'use strict'

const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const Readline = SerialPort.parsers.Readline
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const fs = require('fs')

module.exports  = class ArduinoSensors  {

    constructor(path, config) {
        this._path = path
        this._port = new SerialPort(path, { baudRate: config.baudRate, autoOpen: false })
        this._parser = this.parse()
    }

    static count_occurrence(buff) {
        let count = 0
        for (const value of buff.values()) {
            if (value === 0x2c)
                count++
        }
        return count
    }

    get path() {
        return this._path
    }

    get port() {
        return this._port
    }

    get parser() {
        return this._parser
    }

    openPort() {
        this.port.open(err => {
            if (err) {
                console.log(err)
                process.exit(1)
            }
        })
    }

    async start(config, config_arduino, test_env, env, timestamp, current_sensor) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }

        const csvWriter = createCsvWriter({
            path: `${config_arduino["data repository"]}/InfraRed_${timestamp}_${test_env.toVary}${env.temperature}.csv`,
            header: [
                {id: 'timestamp', title: 'TIMESTAMP'},
                {id: 'temperature', title: 'temperature'},
                {id: 'red_color', title: 'RED COLOR'},
                {id: 'green_color', title: 'GREEN COLOR'},
                {id: 'blue_color', title: 'BLUE COLOR'},
                {id: 'humidity', title: "HUMIDITY"},
                {id: 'lux', title: 'LUX'}
            ]
        })
        const records = []
        await csvWriter.writeRecords(records)

        this.parser.on('data', data => {
            data = Buffer.concat([new Buffer(Date.now().toString()), new Buffer([0x2c]), new Buffer(data)])
            if (ArduinoSensors.count_occurrence(data) !== 6) return
            data += '\n'
            fs.appendFile(`${config_arduino["data repository"]}/${current_sensor.type}_${timestamp}_${test_env.toVary}${ ArduinoSensors.getValue(test_env, env) }.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    stop(){
        this.port.close()
        this.parser.removeAllListeners('data')
    }

    static getValue(test_env, env) {
        switch (test_env.toVary) {
            case "temperature":
                return env.temperature
            case "color":
                return env.color
            case "surface":
                return env.surface
            case "lux":
                return env.lux
            case "humidity":
                return env.humidity
            default:
                return "null"
        }
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x0a]) })).pipe(new Readline({ delimiter: '\n' }))
    }
}