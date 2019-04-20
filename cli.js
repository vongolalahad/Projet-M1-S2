/**
 *
 *
 *
 */

'use strict'

const configs = {
    config: require('./config/config'),
    arduino: require('./config/arduino'),
    stm32_IR: require('./config/stm32_IR'),
    ultrasound: require('./config/ultrasound')
}
const default_test_env = require('./environment/Environment').default_test_env
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
const SerialPort = require('serialport')

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
let commands = new Map()
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
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
`      ${colors.key(`Environment ${++i}:`)} ${colors.value(env.toString())}
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
            if (!params.includes(param))
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

async function ask_sensor_to_use() {
    return await inquirer.prompt([
        {
            type: 'list',
            name: 'sensor_to_use',
            message: 'Which sensor are you using ?',
            choices: [
                'Infra red',
                'Ultra sound',
            ]
        }
    ])
}

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

function return_default_config() {
    return { config: configs.config, arduino_config: configs.arduino, stm_ir_config: configs.stm32_IR, stm_ultrasound_config: configs.ultrasound }
}

function return_default_env() {
    return default_test_env
}

async function change_ports(configs) {
    let ports = (await SerialPort.list()).map(port => port.comName)
    let port_to_change
    let question = [
        {
            type: 'list',
            name: 'port_to_change',
            message: 'Which port to change ?',
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
            message: 'Do you want to change another port ?',
            default: false
        }
    ]
    do {
        port_to_change = (await inquirer.prompt(question)).port_to_change
        if (port_to_change === "Arduino")
            configs.arduino_config.port = (await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_port',
                    message: 'What is the new port? ',
                    choices: ports
                }
            ])).new_port
        if (port_to_change === "Infra red sensor")
            configs.stm_ir_config.port = (await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_port',
                    message: 'What is the new port? ',
                    choices: ports
                }
            ])).new_port
        if (port_to_change === "Ultra sound sensor")
            configs.stm_ultrasound_config.port = (await inquirer.prompt([
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

async function change_baud_rates(configs) {
    let baudRates = [ "110", "300", "1200", "2400", "4800", "9600", "14400", "19200", "38400", "57600", "115200" ]
    let baud_rate_to_change
    let question = [
        {
            type: 'list',
            name: 'baud_rate_to_change',
            message: 'Which baud rate to change ?',
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
            message: 'Do you want to change another baud rate ?',
            default: false
        }
    ]
    do {
        baud_rate_to_change = (await inquirer.prompt(question)).baud_rate_to_change
        if (baud_rate_to_change === "Arduino")
            configs.arduino_config.baudRate = Number((await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_baud_rate',
                    message: 'Choose the correct baud rate ',
                    choices: baudRates
                }
            ])).new_baud_rate)
        if (baud_rate_to_change === "Infra red sensor")
            configs.stm_ir_config.baudRate = Number((await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_baud_rate',
                    message: 'Choose the correct baud rate ',
                    choices: baudRates
                }
            ])).new_baud_rate)
        if (baud_rate_to_change === "Ultra sound sensor")
            configs.stm_ultrasound_config.baudRate = Number((await inquirer.prompt([
                {
                    type: 'list',
                    name: 'new_port',
                    message: 'Choose the correct baud rate ',
                    choices: baudRates
                }
            ])).new_baud_rate)
    } while (((await inquirer.prompt(to_continue)).ask_continue))
    return configs
}

async function change_timeout(configs) {}

async function change_data_rep(configs) {}

async function change_measurement_time(configs) {}

async function change_imprecision(configs, imprecision) {}

async function exec_command(name, test_env, configs) {
    let command = commands.get(name)
    await command.execute(test_env, configs)
}

async function choose_test_env() {
    return await inquirer.prompt([
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
}

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
    change_data_rep: change_data_rep,
    change_measurement_time: change_measurement_time,
    change_imprecision: change_imprecision,
    return_default_config: return_default_config,
    return_default_env: return_default_env,
    ask_to_run: ask_to_run,
    exec_command: exec_command,
    choose_test_env: choose_test_env,
    ask_to_use_arduino: ask_to_use_arduino

}