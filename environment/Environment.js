"use strict"

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

    get toVary() {
        return this._toVary
    }

    toString() {
        return `[ Environment: id=${this._id} temperature=${this.temperature}, color=${this.color}, lux=${this.lux} ]`
    }

}

const default_env = [
    new Environment(-30, null, null, "temperature"),
    new Environment(-15, null, null, "temperature"),
    new Environment(0, null, null, "temperature"),
    new Environment(15, null, null, "temperature"),
    new Environment(30, null, null, "temperature"),
    new Environment(45, null, null, "temperature")
]

module.exports = {
    Environment: Environment,
    default_env: default_env
}