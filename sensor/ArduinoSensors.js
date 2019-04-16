const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength

const fs = require('fs')

const Sensor = require('./Sensor')

module.exports  = class ArduinoSensors  {

    constructor(path, config) {
        this._path = path
        this._port = new SerialPort(path, { baudRate: config.baudRate, autoOpen: false })
        this._parser = this.parse()
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

    startStream() {
        this.port.open(err => {
            if (err) {
                console.log(err)
                process.exit(1)
            }
        })
    }

    start(config, config_sensor, timestamp) {

    }

    stop(){

    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x0a]) })).pipe(new ByteLength({ length: 30 }))
    }
}