
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready

module.exports = class Sensor {

    constructor(path, config) {
        this._port = new SerialPort(path, { baudRate: config.baudRate, autoOpen: false })
        this._parser = this.parse()
    }

    get port() {
        return this._port
    }

    get parser() {
        return this._parser
    }

    /**
     * Starting test for this sensor
     * param: config
     */
    start(config, config_sensor, env, timestamp) {

    }

    stop() {
        this.port.close()
    }

    parse() {

    }

}