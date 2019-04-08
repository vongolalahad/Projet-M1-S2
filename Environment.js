
class Environment {
    
    constructor(temperature, color, lux) {
        this._temperature = temperature
        this._color = color
        this._lux = lux
    }
    
    get temperature() {
        return this._temperature
    }
    
    set temperature(val){
        throw new Error('Cannot change the value of temperature')
    }
    
    get _temperature() {
        console.log(`It's recommended to use the property "temperature" instead of "_temperature"`)
    }
    
    get color() {
        return this._color
    }
    
    set color(val){
        throw new Error('Cannot change the value of color')
    }
    
    get _color() {
        console.log(`It's recommended to use the property "color" instead of "_color"`)
    }
    
    get lux() {
        return this._lux
    }
    
    set lux(val){
        throw new Error('Cannot change the value of lux')
    }
    
    get _lux() {
        console.log(`It's recommended to use the property "lux" instead of "_lux"`)
    }
}
/*
Environment.prototype.toString = function toString () {
    console.log("aqaa")
}*/
