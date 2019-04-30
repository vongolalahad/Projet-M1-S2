'use strict'

const SerialPort = require('serialport')

/**
 * Instantiate a serialport object for a Sensor
 *
 *
 */
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
     * Start sample data from a sensor (open the serial port, add data in csv file)
     *
     * @param { object } config An object containing the general configuration of the application (data storage, ...)
     * @param { object } config_sensor An object containing the different configuration of the ultrasound sensor
     * @param { module.Test } test_env An instance of Test containing the different environment for the test and the property that vary
     * @param { module.Environment } env The current environment of test
     * @param { number }timestamp The timestamp describing the start of the test for the specified environment
     * @returns {Promise<void>}
     */
    async start(config, config_sensor, test_env, env, timestamp) {

    }

    /**
     * Close the serial port of the sensor
     */
    stop() {
        this.port.close()
        this.parser.removeAllListeners('data')
    }

    /**
     * Parse the received data to have the right form
     */
    parse() {

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

}