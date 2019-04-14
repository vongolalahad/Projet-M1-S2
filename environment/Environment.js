"use strict"

const Test = require('./Test')

class Environment {

    constructor(temperature, color, lux) {
        if (Environment.count === undefined) Environment.count = 0
        Environment.count++
        this._id = Environment.count
        this._temperature = temperature
        this._color = color
        this._lux = lux
    }
    
    get temperature() {
        return this._temperature
    }
    
    get color() {
        return this._color
    }
    
    get lux() {
        return this._lux
    }

    toString() {
        return `[ Environment: id=${this._id} temperature=${this.temperature}, color=${this.color}, lux=${this.lux} ]`
    }

}

const default_temperature_env = [
    new Environment(-30, null, null),
    new Environment(-15, null, null),
    new Environment(0, null, null),
    new Environment(15, null, null),
    new Environment(30, null, null),
    new Environment(45, null, null)
]

const default_color_env = [
    new Environment(null, "red", null),
    new Environment(null, "green", null),
    new Environment(null, "blue", null),
    new Environment(null, "white", null),
    new Environment(null, "yellow", null),
]

const default_test_env = [
    new Test("temperature", default_temperature_env),
    new Test("color", default_color_env)
]

module.exports = {
    Environment: Environment,
    default_test_env: default_test_env
}