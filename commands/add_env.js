'use strict'

const inquirer = require('inquirer')
const Environment = require('../environment/Environment').Environment

const inputNumber = ["temperature", "lux", "humidity"]

function typeOfInput(param) {
    if (inputNumber.includes(param)) {
        return "number"
    }
    return "input"
}

function inputStringToNumber(param, value) {
    if (inputNumber.includes(param) && value != null)
        return Number(value)
    return value
}

async function choose_test_env() {
    let result = await inquirer.prompt([
        {
            type: 'list',
            name: 'test_env_to_use',
            message: 'Which property do you want to vary ?',
            choices: [
                'temperature',
                'color',
                "surface"
            ]
        }
    ])
    return result
}

module.exports = {
    name: "add_env",
    description: "Add an environment",
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