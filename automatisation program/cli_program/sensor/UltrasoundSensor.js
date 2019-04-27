'use strict'

const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

/**
 * The sensor class
 * @type {module.Sensor|*}
 */
const Sensor = require('./Sensor')

/**
 *
 * An ultrasound sensor that will read stream from a serial port when her method start is called and a sequence of bytes 0x04 0x01 appeared.
 * It will read by 20 bytes
 */
module.exports = class UltrasoundSensor extends Sensor{

    /**
     * The constructor
     * @param { string } path The string path of the serial port
     * @param { object } config An object containing the different configuration of the ultrasound sensor
     * @param { string } type The type of the sensor (here ultra sound)
     */
    constructor(path, config, type) {
        super(path, config, type)
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

    /**
     * Start sample data from the sensor (open the serial port, add data in csv file)
     *
     * @param { object } config An object containing the general configuration of the application (data storage, ...)
     * @param { object } config_sensor An object containing the different configuration of the ultrasound sensor
     * @param { module.Test } test_env An instance of Test containing the different environment for the test and the property that vary
     * @param { module.Environment } env The current environment of test
     * @param { number }timestamp The timestamp describing the start of the test for the specified environment
     * @returns {Promise<void>}
     */
    async start(config, config_sensor, test_env, env, timestamp) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }
        /*
         * Open the serial port
         */
        this.port.open(err => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
        })

        /**
         * Create the header for the data that will be stocked in the csv file
         */
        const csvWriter = createCsvWriter({
            path: `${config_sensor["data repository"]}/Ultrasound_${timestamp}_${test_env.toVary}${env.temperature}.csv`,
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

        /**
         * Read data coming from the ultrasound sensor and stock it in a csv file with the format of the file being: Ultrasound_timestamp_propertyThatVary_propertyValue.csv
         */
        this.parser.on('data', (data) => {
            data = data.slice(0, data.length - 2)
            data = Buffer.concat([new Buffer(Date.now().toString()), new Buffer([0x2c]), data, new Buffer([0x0a])])

            // If the data is not valid (more or less than 4 information (timestamp, status, distance) received) the data is wrong. So we don't stock it
            if (UltrasoundSensor.count_occurrence(data) !== 4) return

            fs.appendFile(`${config_sensor["data repository"]}/Ultrasound_${timestamp}_${test_env.toVary}${ Sensor.getValue(test_env, env) }.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    /**
     * A line of data ends with the sequence 0x04 0x01 and have a length of 20 bytes.
     * This function parse the received data to have that form
     *
     * @returns {SerialPort.parsers.ByteLength} The parser to use when we want to read or stock the data as they were send
     */
    parse() {
        return this.port.pipe(new Ready({ delimiter: new Buffer([0x04, 0x01]) })).pipe(new ByteLength({ length: 20 }))
    }

}