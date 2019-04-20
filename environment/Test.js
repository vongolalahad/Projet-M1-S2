'use strict'
/**
 *
 * @type {module.Test}
 */
module.exports = class Test {

    constructor(toVary, environments) {
        this._toVary = toVary
        this._environments = environments
    }

    get toVary() {
        return this._toVary
    }

    get environments() {
        return this._environments
    }
}