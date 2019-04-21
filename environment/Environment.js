/**
 *
 */

"use strict"

const Test = require('./Test')

class Environment {

    constructor(temperature, color, surface, lux, humidity) {
        if (Environment.count === undefined) Environment.count = 0
        Environment.count++
        this._id = Environment.count
        this._temperature = temperature
        this._color = color
        this._surface = surface
        this._lux = lux
        this._humidity = humidity
    }

    get id() {
        return this._id
    }
    
    get temperature() {
        return this._temperature
    }
    
    get color() {
        return this._color
    }

    get surface() {
        return this._surface
    }
    
    get lux() {
        return this._lux
    }

    get humidity() {
        return this._humidity
    }

    toString() {
        return `[ Environment: id=${this._id}, temperature=${this.temperature}, color=${this.color}, surface=${this.surface}, lux=${this.lux} ]`
    }

    inspect(depth, opts) {
        return `[ Environment: id=${this._id}, temperature=${this.temperature}, color=${this.color}, surface=${this.surface}, lux=${this.lux} ]`
    }

}

const default_temperature_env = [
    new Environment(-30, null, null, null, null),
    new Environment(-15, null, null, null, null),
    new Environment(0, null, null, null, null),
    new Environment(15, null, null, null, null),
    new Environment(30, null, null, null, null),
    new Environment(45, null, null, null, null)
]

const default_color_env = [
    new Environment(null, "red", null, null, null),
    new Environment(null, "green", null, null, null),
    new Environment(null, "blue", null, null, null),
    new Environment(null, "white", null, null, null),
    new Environment(null, "yellow", null, null, null),
]

const default_surface_env = [
    new Environment(null, null, "plexiglass", null, null),
    new Environment(null, null, "plywood", null, null),
    new Environment(null, null, "foam", null, null),
    new Environment(null, null, "concrete", null, null),
]

const default_test_env = [
    new Test("temperature", default_temperature_env),
    new Test("color", default_color_env),
    new Test("surface", default_surface_env)
]

module.exports = {
    Environment: Environment,
    default_test_env: default_test_env
}