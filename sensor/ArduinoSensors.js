const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength

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

    start(config, config_arduino, test_env, env, timestamp, current_sensor, count) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }

        this.parser.on('data', data => {
            data = Buffer.concat([new Buffer(Date.now().toString()), new Buffer([0x2c]), data])
            if (ArduinoSensors.count_occurrence(data) !== 6) return
            fs.appendFile(`${config_arduino.data_rep}/${current_sensor.type}_${timestamp}_${test_env.toVary}${test_env.toVary === "temperature" ? env.temperature : env.color }.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    stop(){
        this.port.close()
        this.parser.removeAllListeners('data')
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x0a]) })).pipe(new ByteLength({ length: 32 }))
    }
}