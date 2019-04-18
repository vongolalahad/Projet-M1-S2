
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready

module.exports = class Sensor {

    constructor(path, config, type) {
        this._type = type
        this._path = path
        this._port = new SerialPort(path, { baudRate: config.baudRate, autoOpen: false })
        this._parser = this.parse()
    }

    get type() {
        return this._type
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

    /**
     * Starting test for this sensor
     * param: config
     */
    async start(config, config_sensor, test_env, env, timestamp) {

    }

    stop() {
        this.port.close()
        this.parser.removeAllListeners('data')
    }

    parse() {

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

    async timer(time) {
        return new Promise( (resolve, reject) => {
            setTimeout(()=>{
                clearTimeout(clear)
                resolve("finish")
            },time)
        })
    }

}