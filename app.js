/**
 *
 *
 *
 */

"use strict"

const colors = require("colors/safe")
require('colors').setTheme({
    title: "blue",
    subtitle: "green",
    key: "white",
    value: "yellow",
    measurement: ["white", "bold"]
})
const cli = require('./cli')
const IRSensor = require('./sensor/IRSensor')
const UltrasoundSensor = require('./sensor/UltrasoundSensor')
const ArduinoSensors = require('./sensor/ArduinoSensors')
const progress = require('cli-progress')

const cli_param_command = {
    "port": cli.change_ports,
    "baudRate": cli.change_baud_rates,
    "timeout": cli.change_timeout,
    "data repository": cli.change_data_rep,
    "measurement time": cli.change_measurement_time,
    "imprecision temperature": cli.change_imprecision
}

// return object : {config.config, config.arduino, config.stm32_IR, config.stm32ultra, sensor_used(object of the class)}
async function run_cli() {
    let param_to_change, sensor_to_use, configs, execute_command, command_to_execute, sensor_config_to_use, test_env, test_env_to_use

    cli.list_default_parameter()
    cli.list_default_env()
    configs = cli.return_default_config()
    test_env = cli.return_default_env()

    param_to_change = (await cli.ask_parameter_to_change()).change_parameters

    for (const param of param_to_change) {
        configs = await cli_param_command[param](configs, param)
    }

    execute_command = (await cli.ask_exec_command()).ask_execute_command
    if (execute_command) {
        command_to_execute = (await cli.command_to_execute()).command_to_exec
        await cli.exec_command(command_to_execute, test_env, configs)
        while ((await cli.ask_exec_another_command()).ask_execute_command) {
            command_to_execute = (await cli.command_to_execute()).command_to_exec
            await cli.exec_command(command_to_execute, test_env, configs)
        }
    }

    test_env_to_use = (await cli.choose_test_env()).test_env_to_use
    test_env_to_use = test_env.find(test => { return test.toVary === test_env_to_use })

    sensor_to_use = (await cli.ask_sensor_to_use()).sensor_to_use
    if (sensor_to_use === "Infra red") {
        sensor_to_use = new IRSensor(configs.stm_ir_config.port, configs.stm_ir_config, "InfraRed")
        sensor_config_to_use = configs.stm_ir_config
    }
    if (sensor_to_use === "Ultra sound") {
        sensor_to_use = new UltrasoundSensor(configs.stm_ultrasound_config.port, configs.stm_ultrasound_config, "Ultrasound")
        sensor_config_to_use = configs.stm_ultrasound_config
    }

    return { config:configs.config, arduino_config:configs.arduino_config, sensor_config:sensor_config_to_use, sensor:sensor_to_use, test_env: test_env_to_use }
}

async function main() {
    let timestamp
    let use_arduino
    let arduino_sensors

    const { config, arduino_config, sensor_config, sensor, test_env} = await run_cli()
    do {
        
    } while (!(await cli.ask_to_run()).ask_start_test)

    use_arduino = (await cli.ask_to_use_arduino()).ask_use_arduino
    if (use_arduino)
        arduino_sensors = new ArduinoSensors(arduino_config.port, arduino_config)

    for (let i = 0; i < test_env.environments.length; i++) {
        arduino_sensors.openPort()

        timestamp = Date.now()
        let pass = await checking(config, arduino_config, test_env, test_env.environments[i], arduino_sensors)
        if (pass) {
            arduino_sensors !== undefined ? arduino_sensors.stop() : ''
            await timer(2000)
            continue
        }
        await sensor.start(config, sensor_config, test_env, test_env.environments[i], timestamp)
        arduino_sensors !== undefined ? await arduino_sensors.start(config, arduino_config, test_env, test_env.environments[i], timestamp, sensor) : ''
        console.log(colors.measurement(`Start measuring the distance with ${test_env.toVary}=${ getValue(test_env, test_env.environments[i]) } it will take ${config["measurement time"]} seconds`))
        await timer(config["measurement time"]*1000)

        console.log(colors.measurement(`The measurement of the distance with ${test_env.toVary}=${ getValue(test_env, test_env.environments[i]) } is finished...\n`))
        sensor.stop()
        arduino_sensors !== undefined ? arduino_sensors.stop() : ''
        await timer(2000)
    }
}

async function checking(config, arduino_config, test_env, env, arduino_sensors) {

    if (arduino_sensors === undefined) {
        await timer(config.timeout*1000)
        return
    }

    let value
    let finish = false
    let bar_timer
    let bar
    let pass
    console.log(colors.white(`\nYou have ${config.timeout} seconds to change the ${test_env.toVary} to ${ getValue(test_env, env) }. If not, the program will try to test the next environment!`))

    bar = new progress.Bar({
        format: '[{bar}] {value} secs/{total}',
        barCompleteChar: '=',
        barIncompleteChar: '-',
        barsize: 40,
        stream: process.stdout
    })
    bar.start(config.timeout, 0)
    bar_timer = setInterval(() => {
        bar.increment()
        if (bar.value >= bar.total) {
            bar.stop()
            finish = true
            pass = true
        }

    }, 1000)

    while (!finish) {
        switch (test_env.toVary) {
            case 'temperature':
                arduino_sensors.parser.pause()
                await timer(3*1000)
                value = arduino_sensors.parser.read(4)
                if (Number(value) <= env.temperature + Number(arduino_config.imprecision_temperature) && Number(value) >= env.temperature - Number(arduino_config.imprecision_temperature)) {
                    finish = true
                    clearInterval(bar_timer)
                    bar.stop()
                }
                arduino_sensors.parser.resume()
                await timer(1000)
                break
            case 'lux':
                arduino_sensors.parser.pause()
                await timer(3*1000)
                value = arduino_sensors.parser.read()
                value = value.split(',')[5]
                value = ((new Buffer(value)).slice(0, 3)).toString()
                if (Number(value) !== Number(env.lux)) {
                    finish = true
                    clearInterval(bar_timer)
                    bar.stop()
                }
                arduino_sensors.parser.resume()
                await timer(1000)
                break
            case 'humidity':
                arduino_sensors.parser.pause()
                await timer(3*1000)
                value = arduino_sensors.parser.read()
                value = value.split(',')[4]
                if (Number(value) !== Number(env.humidity)) {
                    finish = true
                    clearInterval(bar_timer)
                    bar.stop()
                }
                arduino_sensors.parser.resume()
                await timer(1000)
                break
            default:
                finish = true
                await timer(config.timeout)
        }
    }
    return pass
}

function timer(time) {
    return new Promise( (resolve, reject) => {
        setTimeout(()=>{
            resolve("finish")
        },time)
    })
}

function getValue(test_env, env) {
    switch (test_env.toVary) {
        case "temperature":
            return env.temperature
        case "color":
            return env.color
        case "surface":
            return env.surface
        case "lux":
            return env.lux
        case "humidity":
            return env.humidity
        default:
            return "null"
    }
}

main().then(() => {
    console.log()
    console.log(colors.green.bold("All test finished are finished."))
    process.exit(0)
})