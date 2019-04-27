/**
 * cli add_env
 * Allow the user to add environment to the running program
 *
 */

'use strict'

const inquirer = require('inquirer')                                        // The inquirer module
const Environment = require('../environment/Environment').Environment       // The Environment constructor

const INPUTNUMBER = ["temperature", "lux", "humidity"]                      // Array containing the property that should be decimal number

/**
 * Define the type of input of the parameter (number or input)
 * Test if the string put as parameter is included inside {{INPUTNUMBER}}. If it is
 * so the type is a number and return "number". Else return "input"
 *
 * @param {string} param the input we are testing
 * @returns {string}
 */
function typeOfInput(param) {
    if (INPUTNUMBER.includes(param)) {
        return "number"
    }
    return "input"
}

/**
 *
 * @param {string} param
 * @param {string} value
 * @returns {*}
 */
function inputStringToNumber(param, value) {
    if (INPUTNUMBER.includes(param) && value != null)
        return Number(value)
    return value
}

/**
 * Choose the property that should change in the new environment
 *
 * @returns {Promise<*>}
 */
async function choose_test_env() {
    let test_env = ["temperature", "color", "surface", "lux", "humidity"]
    return await inquirer.prompt([
        {
            type: 'list',
            name: 'test_env_to_use',
            message: 'Which property do you want to vary ?',
            choices: test_env
        }
    ])
}

module.exports = {
    /**
     * The name of the command
     */
    name: "add_env",

    /**
     * The description of the command
     */
    description: "Add an environment",

    /**
     * The function to execute to execute the command
     *
     * @param test_env
     * @returns {Promise<*>}
     */
    execute: async function (test_env) {
        let params = [ "temperature", "color", "surface", "lux", "humidity" ]
        let value_params = []
        for (let param of params) {
            let result = await inquirer.prompt([
                {
                    type: param === typeOfInput(param),
                    name: param,
                    message: `Value of ${param}`,
                    default: "no value",
                    validate: function(ans) {
                        if ( typeOfInput(param) !== "number" || ans === "no value" ) return true
                        if (isNaN(ans)) {
                            return "You have to put a number"
                        }
                        return true
                    }
                }
            ])
            if (result[param] === "no value") result[param] = null
            value_params.push(inputStringToNumber(param, result[param]))
        }
        let toVary = (await choose_test_env()).test_env_to_use
        let newEnv = new Environment(...value_params)
        for (let test of test_env) {
            if (test.toVary === toVary) {
                test.environments.push(newEnv)
                test.environments.sort((env1, env2) => {
                    if (toVary === "temperature") {
                        return env1.temperature - env2.temperature
                    }
                    if (toVary === "humidity") {
                        return env1.humidity - env2.humidity
                    }
                    if (toVary === "lux") {
                        return env1.lux - env2.lux
                    }
                    return 0
                })
                break
            }
        }
        return test_env
    }
}