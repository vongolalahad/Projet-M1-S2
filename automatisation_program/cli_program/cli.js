/**
 * The mudule containing the functions to interact in command line with the user
 *
 */

'use strict'

require('colors').setTheme({
    title: "blue",
    subtitle: "green",
    key: "white",
    value: "yellow",
    measurement: ["white", "bold"]
})
const colors = require('colors/safe')
const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const SerialPort = require('serialport')

const configs = {
    config: require('../config/config'),
    arduino: require('../config/arduino'),
    stm32_IR: require('../config/stm32_IR'),
    ultrasound: require('../config/ultrasound')
}
const default_test_env = require('./environment/Environment').default_test_env

const commandFiles = fs.readdirSync(`${path.dirname(fs.realpathSync(__filename))}/commands`).filter(file => file.endsWith('.js'))
let commands = new Map()
for (const file of commandFiles) {
    const command = require(`${path.dirname(fs.realpathSync(__filename))}/commands/${file}`)
    commands.set(command.name, command)
}

/**
 * List default parameters of the application
 */
function list_default_parameter() {
    console.log(
`
${colors.title("==================== Default parameters ====================")}

${colors.subtitle("===== General config")}`
    )
    Object.entries(configs.config).forEach(entry => {
        console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
        )
    })
    console.log(
`
${colors.subtitle("===== Arduino config")}`
    )
    Object.entries(configs.arduino).forEach(entry => {
        console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
        )
    })
    console.log(
`
${colors.subtitle("===== Infra red sensor config")}`
    )
    Object.entries(configs.stm32_IR).forEach(entry => {
        console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
        )
    })
    console.log(
`
${colors.subtitle("===== Ultra sound sensor config")}`
    )
    Object.entries(configs.ultrasound).forEach(entry => {
        console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
        )
    })
}

/**
 * List default environments of the application
 *
 */
function list_default_env() {
    let i = 0
    console.log(
`
${colors.title("==================== Default environments ==================")}
`
    )
    default_test_env.forEach(test => {
        console.log(
`${colors.gray.bold(`===== Test on different ${test.toVary}`)}
`
        )
        test.environments.forEach(env => {
            console.log(
`      ${colors.key(`Environment ${++i}:`)} ${colors.value(env)}
`
            )
        })
    })
}

/**
 * Ask the parameter of the application to change
 *
 * @returns {Promise<*>}
 */
async function ask_parameter_to_change() {
    let params = [{ name: "Nothing" }]
    for (const config of Object.values(configs)) {
        for (const param of Object.keys(config)) {
            if (params.find(elt => { return elt.name === param }) === undefined)
                params.push({ name: param })
        }
    }
    return await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'change_parameters',
            message: `Which parameters do you want to change ?`,
            choices: params,
            validate: function (answer) {
                return !(answer.length > 1 && answer.includes("Nothing"))
            }
        }
    ])
}

/**
 * Ask the sensor to use
 * 
 * @returns {Promise<*>}
 */
async function ask_sensor_to_use() {
    return await inquirer.prompt([
        {
            type: 'list',
            name: 'sensor_to_use',
            message: 'Which sensor are you using ?',
            choices: [
                'infra red',
                'ultra sound',
            ]
        }
    ])
}

/**
 * Ask the user if he/she wants to execute a command (ls_env or ls_param, ...)
 * @returns {Promise<*>}
 */
async function ask_exec_command() {
    return await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ask_execute_command',
            message: 'Do you want to execute a command ?',
            default: false
        }
    ])
}

/**
 * Ask the user if he/she wants to  execute another command after the one finished
 * 
 * @returns {Promise<*>}
 */
async function ask_exec_another_command() {
    return await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ask_execute_command',
            message: 'Do you want to execute another command ?',
            default: false
        }
    ])
}

/**
 * Ask the user the command to execute
 * 
 * @returns {Promise<*>}
 */
async function command_to_execute() {
    let list_commands = []
    commands.forEach((key, value, map) =>{
        list_commands.push(key)
    })
    return await inquirer.prompt([
        {
            type: 'list',
            name: 'command_to_exec',
            message: 'Which command do you want to execute ?',
            choices: list_commands
        }
    ])
}

/**
 * Return the default configuration of the application
 * 
 * @returns {{config: object, arduino_config: object, stm_ir_config: object, ultrasound_config: object}}
 */
function return_default_config() {
    return { config: configs.config, arduino_config: configs.arduino, stm_ir_config: configs.stm32_IR, ultrasound_config: configs.ultrasound }
}

/**
 * Return the defaults Test objects
 * 
 * @returns {Test[]}
 */
function return_default_env() {
    return default_test_env
}

/**
 * Change the serial port of a sensor or the arduino
 * 
 * @param { object } configs The current of the application (general configs, sensor configs and arduino configs)
 * @returns {Promise<*>}
 */
async function change_ports(configs) {
    let ports = (await SerialPort.list()).map(port => port.comName)
    let port_to_change
    let question = [
        {
            type: 'list',
            name: 'port_to_change',
            message: 'Which port to change ?',
            choices: [
                "arduino",
                "infra red sensor",
                "ultra sound sensor"
            ]
        }
    ]
    let to_continue = [
        {
            type: 'confirm',
            name: 'ask_continue',
            message: 'Do you want to change another port ?',
            default: false
        }
    ]
    do {
        port_to_change = (await inquirer.prompt(question)).port_to_change
        if (port_to_change === "arduino")
            configs.arduino_config.port = (await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_port',
                    message: 'What is the new port? ',
                    choices: ports
                }
            ])).new_port
        if (port_to_change === "infra red sensor")
            configs.stm_ir_config.port = (await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_port',
                    message: 'What is the new port? ',
                    choices: ports
                }
            ])).new_port
        if (port_to_change === "ultra sound sensor")
            configs.ultrasound_config.port = (await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_port',
                    message: 'What is the new port? ',
                    choices: ports
                }
            ])).new_port
    } while (((await inquirer.prompt(to_continue)).ask_continue))
    return configs
}

/**
 * Change the baudrate of a sensor or the arduino
 * 
 * @param { object } configs The current of the application (general configs, sensor configs and arduino configs)
 * @returns {Promise<*>}
 */
async function change_baud_rates(configs) {
    let baudRates = [ "110", "300", "1200", "2400", "4800", "9600", "14400", "19200", "38400", "57600", "115200" ]
    let baud_rate_to_change
    let question = [
        {
            type: 'list',
            name: 'baud_rate_to_change',
            message: 'Which baud rate to change ?',
            choices: [
                "arduino",
                "infra red sensor",
                "ultra sound sensor"
            ]
        }
    ]
    let to_continue = [
        {
            type: 'confirm',
            name: 'ask_continue',
            message: 'Do you want to change another baud rate ?',
            default: false
        }
    ]
    do {
        baud_rate_to_change = (await inquirer.prompt(question)).baud_rate_to_change
        if (baud_rate_to_change === "arduino")
            configs.arduino_config.baudRate = Number((await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_baud_rate',
                    message: 'Choose the correct baud rate ',
                    choices: baudRates
                }
            ])).new_baud_rate)
        if (baud_rate_to_change === "infra red sensor")
            configs.stm_ir_config.baudRate = Number((await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_baud_rate',
                    message: 'Choose the correct baud rate ',
                    choices: baudRates
                }
            ])).new_baud_rate)
        if (baud_rate_to_change === "ultra sound sensor")
            configs.ultrasound_config.baudRate = Number((await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_baud_rate',
                    message: 'Choose the correct baud rate ',
                    choices: baudRates
                }
            ])).new_baud_rate)
    } while (((await inquirer.prompt(to_continue)).ask_continue))
    return configs
}

/**
 * Change the timeout (time to wait for the user to change the value of a property to satisfy an environment)
 * 
 * @param { object } configs The current of the application (general configs, sensor configs and arduino configs)
 * @param name
 * @returns {Promise<*>}
 */
async function change_timeout(configs, name) {
    configs.config.timeout = (await inquirer.prompt([
        {
            type: "number",
            name: name,
            message: `New ${name}: `,
            default: 30,
            validate: function (ans) {
                if (isNaN(ans))
                    return "You have to put a number"
                return true
            }
        }
    ]))[name]
    return configs
}

/**
 * Change the repository where to stock the data/sheet for a sensor
 * 
 * @param { object } configs The current of the application (general configs, sensor configs and arduino configs)
 * @param name
 * @returns {Promise<*>}
 */
async function change_rep(configs, name) {
    let rep_to_change         // The sensor which we want to change the repository
    let question = [
        {
            type: 'list',
            name: 'rep_to_change',
            message: 'Which sensor do you want to change the data repository ?',
            choices: [
                "Arduino",
                "Infra red sensor",
                "Ultra sound sensor"
            ]
        }
    ]
    let to_continue = [
        {
            type: 'confirm',
            name: 'ask_continue',
            message: `Do you want to change another ${name} ?`,
            default: false
        }
    ]
    do {
        rep_to_change = (await inquirer.prompt(question)).rep_to_change
        if (rep_to_change === "Arduino")
            configs.arduino_config[name] = (await inquirer.prompt([
                {
                    type: 'input',
                    name: 'new_rep',
                    message: `Choose the correct ${name} `,
                    default: './data/arduino'
                }
            ])).new_rep
        if (rep_to_change === "Infra red sensor")
            configs.stm_ir_config[name] = (await inquirer.prompt([
                {
                    type: 'input',
                    name: 'new_rep',
                    message: `Choose the correct baud rate ${name} `,
                    default: './data/stmIR'
                }
            ])).new_rep
        if (rep_to_change === "Ultra sound sensor")
            configs.ultrasound_config[name] = (await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_rep',
                    message: `Choose the correct baud rate ${name} `,
                    default: './data/ultrasound'
                }
            ])).new_rep
    } while (((await inquirer.prompt(to_continue)).ask_continue))
    return configs
}

/**
 * Change the measurement time of the tests
 *
 * @param { object } configs The current of the application (general configs, sensor configs and arduino configs)
 * @param name
 * @returns {Promise<*>}
 */
async function change_measurement_time(configs, name) {
    configs.config["measurement time"] = (await inquirer.prompt([
        {
            type: "number",
            name: name,
            message: `New ${name}: `,
            default: 30,
            validate: function (ans) {
                if (isNaN(ans))
                    return "You have to put a number"
                return true
            }
        }
    ]))[name]
    return configs
}

/**
 * Change the imprecision of one of the sensor in the arduino
 *
 * @param { object } configs The current of the application (general configs, sensor configs and arduino configs)
 * @param { string } imprecision
 * @returns {Promise<*>}
 */
async function change_imprecision(configs, imprecision) {
    configs.config[imprecision] = (await inquirer.prompt([
        {
            type: "number",
            name: imprecision,
            message: `New ${imprecision}`,
            default: 30,
            validate: function (ans) {
                if (isNaN(ans))
                    return "You have to put a number"
                return true
            }
        }
    ]))[imprecision]
    return configs
}

async function exec_command(name, test_env, configs) {
    let command = commands.get(name)
    await command.execute(test_env, configs)
}

/**
 * Choose the property that will change in the test
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

/**
 * Ask the user if the test can start
 * @returns {Promise<*>}
 */
async function ask_to_run() {
    console.log()
    return await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ask_start_test',
            message: 'Start the test ?',
            default: false
        }
    ])
}

/**
 * Ask the user if he/she wants to use the arduino ao automate the test
 *
 * @returns {Promise<*>}
 */
async function ask_to_use_arduino() {
    console.log()
    return await inquirer.prompt({
        type: 'confirm',
        name: 'ask_use_arduino',
        message: 'Will you use the sensors in the arduino ?',
        default: true
    })
}

module.exports = {

    list_default_parameter: list_default_parameter,
    list_default_env: list_default_env,
    ask_parameter_to_change: ask_parameter_to_change,
    ask_sensor_to_use: ask_sensor_to_use,
    command_to_execute: command_to_execute,
    ask_exec_command: ask_exec_command,
    ask_exec_another_command: ask_exec_another_command,
    change_ports: change_ports,
    change_baud_rates: change_baud_rates,
    change_timeout: change_timeout,
    change_rep: change_rep,
    change_measurement_time: change_measurement_time,
    change_imprecision: change_imprecision,
    return_default_config: return_default_config,
    return_default_env: return_default_env,
    ask_to_run: ask_to_run,
    exec_command: exec_command,
    choose_test_env: choose_test_env,
    ask_to_use_arduino: ask_to_use_arduino

}