'use strict'

const configs = {
    config: require('./config/config'),
    arduino: require('./config/arduino'),
    stm32_IR: require('./config/stm32_IR'),
    stm32_ultrasound: require('./config/stm32_ultrasound')
}
const default_env = require('./environment/Environment').default_env
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
 * List default parameter of the application
 */
function list_default_parameter() {
    console.log(
`
${colors.title("==================== Default parameters ====================")}

${colors.subtitle("===== General config")}
      ${colors.key("Time out        : ")} ${colors.value(configs.config.timeout)}
      
${colors.subtitle("===== Arduino config")}
      ${colors.key("Port            : ")} ${colors.value(configs.arduino.port)}
      ${colors.key("BaudRate        : ")} ${colors.value(configs.arduino.baudRate)}
      ${colors.key("Data repository : ")} ${colors.value(configs.arduino.data_rep)}
      
${colors.subtitle("===== Infra red sensor config")}
      ${colors.key("Port            : ")} ${colors.value(configs.stm32_IR.port)}
      ${colors.key("BaudRate        : ")} ${colors.value(configs.stm32_IR.baudRate)}
      ${colors.key("Data repository : ")} ${colors.value(configs.stm32_IR.data_rep)}
      
${colors.subtitle("===== Ultra sound sensor config")}
      ${colors.key("Port            : ")} ${colors.value(configs.stm32_ultrasound.port)}
      ${colors.key("BaudRate        : ")} ${colors.value(configs.stm32_ultrasound.baudRate)}
      ${colors.key("Data repository : ")} ${colors.value(configs.stm32_ultrasound.data_rep)}
`
    )
}

function list_default_env() {
    let i = 0
    console.log(
`
${colors.title("==================== Default environments ==================")}
`
    )
    default_env.forEach(env => {
        console.log(
`${colors.key(`Environment ${++i}:`)} ${colors.value(env.toString())}
`
        )
    })
}

async function ask_parameter_to_change() {
    let result = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'change_parameters',
            message: `Which parameters do you want to change ?`,
            choices: [
                { name: 'Nothing' },
                { name: 'Ports' },
                { name: 'Baud Rates' },
            ],
            validate: function (answer) {
                return !(answer.length > 1 && answer.includes("Nothing"))
            }
        }
    ])
    return result
}

async function ask_sensor_to_use() {
    let result = await inquirer.prompt([
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
    return result
}

async function ask_exec_command() {
    let result = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ask_execute_command',
            message: 'Do you want to execute a command ?',
            default: false
        }
    ])
    return result
}

async function ask_exec_another_command() {
    let result = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ask_execute_command',
            message: 'Do you want to execute another command ?',
            default: false
        }
    ])
    return result
}


async function command_to_execute() {
    let list_commands = []
    commands.forEach((key, value, map) =>{
        list_commands.push(key)
    })
    let result = await inquirer.prompt([
        {
            type: 'list',
            name: 'command_to_exec',
            message: 'Which command do you want to execute ?',
            choices: list_commands
        }
    ])
    return result
}

function return_default_config() {
    return { config: configs.config, arduino_config: configs.arduino, stm_ir_config: configs.stm32_IR, stm_ultrasound_config: configs.stm32_ultrasound }
}

function return_default_env() {
    return default_env
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

function exec_command(name, env) {
    let command = commands.get(name)
    command.execute(env)
}

async function ask_to_run() {
    console.log()
    let result = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ask_start_test',
            message: 'Start the test ?',
            default: false
        }
    ])
    return result
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
    return_default_config: return_default_config,
    return_default_env: return_default_env,
    ask_to_run: ask_to_run,
    exec_command: exec_command

}