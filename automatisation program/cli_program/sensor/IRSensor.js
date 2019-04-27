'use strict'

const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

/**
 * The sensor class
 * @type {module.Sensor|*}
 */
const Sensor = require('./Sensor')

/**
 *
 * An infra red sensor that will read stream from a serial port when her method start is called and a \r\n is read.
 *
 * It will read line by line
 */
module.exports  = class IRSensor extends Sensor {

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
        this.port.open((err) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
        })

        /**
         * Create the header for the data that will be stocked in the csv file
         */
        const csvWriter = createCsvWriter({
            path: `${config_sensor["data repository"]}/InfraRed_${timestamp}_${test_env.toVary}${env.temperature}.csv`,
            header: [
                {id: 'timestamp', title: 'TIMESTAMP'},
                {id: 'status', title: 'STATUS'},
                {id: 'distance', title: 'DISTANCE'},
                {id: 'signalRate', title: 'Signal Rate'},
                {id: 'ambientRate', title: 'Ambient Rate'}
            ]
        })
        const records = []
        await csvWriter.writeRecords(records)

        /**
         * Read data coming from the infra red sensor and stock it in a csv file with the format of the file being: InfraRed_timestamp_propertyThatVary_propertyValue.csv
         */
        this.parser.on('data', (data) => {
            data = Date.now() + ", " + data
            let count = data.toString().split(',').length

            // If the data is not valid (more or less than 4 information (status, distance, signal rate, ambiant rate) received) the data is wrong. So we don't stock it
            if (count !== 5) return

            data += "\n"
            fs.appendFile(`${config_sensor["data repository"]}/InfraRed_${timestamp}_${test_env.toVary}${Sensor.getValue(test_env, env)}.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    /**
     * A line of data ends with the sequence \r\n .
     * This function parse the received data to have that form
     *
     * @returns {SerialPort.parsers.ByteLength} The parser to use when we want to read or stock the data as they were send
     */
    parse() {
        return this.port.pipe(new Ready({ delimiter: '\n\r' })).pipe(new Readline({ delimiter: '\n\r' }))
    }
}
