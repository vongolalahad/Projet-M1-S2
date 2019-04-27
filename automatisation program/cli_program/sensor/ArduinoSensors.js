'use strict'

const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const Readline = SerialPort.parsers.Readline
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const fs = require('fs')

/**
 * The arduino sensor that will contain the sensors to automate the test
 *
 * The format of the data will be:
 * Temperature, Red color, Green color, Blue color, Humidity, Lux
 *
 */
module.exports  = class ArduinoSensors  {

    /**
     * The constructor
     * @param { string } path The string path of the serial port
     * @param { object } config An object containing the different configuration of the ultrasound sensor
     */
    constructor(path, config) {
        this._path = path
        this._port = new SerialPort(path, { baudRate: config.baudRate, autoOpen: false })
        this._parser = this.parse()
    }

    /**
     * Count the number of time we have the sequence 0x2c in the buffer specified as parameter
     * @param { Buffer } buff The buffer where to find the sequence
     * @returns {number} The number of time we have the sequence
     */
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

    /**
     * Open the serial port where pass the stream of data
     */
    openPort() {
        this.port.open(err => {
            if (err) {
                console.log(err)
                process.exit(1)
            }
        })
    }

    /**
     * Start sample data from the sensor (open the serial port, add data in csv file)
     *
     * @param { object } config An object containing the general configuration of the application (data storage, ...)
     * @param { object } config_arduino An object containing the different configuration of the ultrasound sensor
     * @param { module.Test } test_env An instance of Test containing the different environment for the test and the property that vary
     * @param { module.Environment } env The current environment of test
     * @param { number }timestamp The timestamp describing the start of the test for the specified environment
     * @param { module.UltrasoundSensor | module.IRSensor } current_sensor
     * @returns {Promise<void>}
     */
    async start(config, config_arduino, test_env, env, timestamp, current_sensor) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }

        /**
         * Create the header for the data that will be stocked in the csv file
         */
        const csvWriter = createCsvWriter({
            path: `${config_arduino["data repository"]}/${current_sensor.type}_${timestamp}_${test_env.toVary}${env.temperature}.csv`,
            header: [
                {id: 'timestamp', title: 'TIMESTAMP'},
                {id: 'temperature', title: 'TEMPERATURE'},
                {id: 'red_color', title: 'RED COLOR'},
                {id: 'green_color', title: 'GREEN COLOR'},
                {id: 'blue_color', title: 'BLUE COLOR'},
                {id: 'humidity', title: "HUMIDITY"},
                {id: 'lux', title: 'LUX'}
            ]
        })
        const records = []
        await csvWriter.writeRecords(records)

        /**
         * Read data coming from the arduino and stock it in a csv file with the format of the file being: typeOfCurrentSensor_timestamp_propertyThatVary_propertyValue.csv
         */
        this.parser.on('data', data => {
            data = Buffer.concat([new Buffer(Date.now().toString()), new Buffer([0x2c]), new Buffer(data)])

            // If the  is not valid (more or less than 6 information (temperature, red color, green color, blue color, humidity, lux) received) the data is wrong. So we don't stock it
            if (ArduinoSensors.count_occurrence(data) !== 6) return

            data += '\n'
            fs.appendFile(`${config_arduino["data repository"]}/${current_sensor.type}_${timestamp}_${test_env.toVary}${ ArduinoSensors.getValue(test_env, env) }.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    /**
     * Close the serial port of the arduino
     */
    stop(){
        this.port.close()
        this.parser.removeAllListeners('data')
    }

    /**
     * Return the value of the sensor that should vary in the test
     *
     * @param test_env
     * @param env
     * @returns {string | null}
     */
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

    /**
     * A line of data ends with the sequence 0x0a (\n).
     * This function parse the received data to have that form
     *
     * @returns {SerialPort.parsers.ByteLength} The parser to use when we want to read or stock the data as they were send
     */
    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x0a]) })).pipe(new Readline({ delimiter: '\n' }))
    }
}
