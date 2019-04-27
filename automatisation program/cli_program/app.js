/**
 * Main CLI program
 * Start the program to do test on a sensor ( Infra red or Ultrasound)
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
const progress = require('cli-progress')
const { execSync } = require('child_process')

const ArduinoSensors = require('./sensor/ArduinoSensors')
/**
 * The function that interact with the user in cli
 * @type {{list_default_parameter, list_default_env, ask_parameter_to_change, ask_sensor_to_use, command_to_execute, ask_exec_command, ask_exec_another_command, change_ports, change_baud_rates, change_timeout, change_data_rep, change_measurement_time, change_imprecision, return_default_config, return_default_env, ask_to_run, exec_command, choose_test_env, ask_to_use_arduino}|*}
 */
const cli = require('./cli')
/**
 * The IRSensor function
 * @type {module.IRSensor|*}
 */
const IRSensor = require('./sensor/IRSensor')
/**
 * The UltrasoundSensor function
 * @type {module.UltrasoundSensor|*}
 */
const UltrasoundSensor = require('./sensor/UltrasoundSensor')
/**
 * The ArduinoSensors function
 * @type {module.ArduinoSensors|*}
 */

/**
 * An associative array that associate a parameter of the program and the function that can change that
 * parameter
 * @type {{port: change_ports, baudRate: change_baud_rates, timeout: change_timeout, "data repository": change_data_rep, "measurement time": change_measurement_time, "temperature imprecision": change_imprecision, "lux imprecision": change_imprecision, "humidity imprecision": change_imprecision, Nothing: cli_param_command.Nothing}}
 */
const cli_param_command = {
    "port": cli.change_ports,
    "baudRate": cli.change_baud_rates,
    "timeout": cli.change_timeout,
    "data repository": cli.change_rep,
    "sheet repository": cli.change_rep,
    "measurement time": cli.change_measurement_time,
    "temperature imprecision": cli.change_imprecision,
    "lux imprecision": cli.change_imprecision,
    "humidity imprecision": cli.change_imprecision,
    "Nothing": function () {}
}

/**
 * Run command line interaction with the user
 *
 * @returns {Promise<{config: *, arduino_config: *, sensor_config: *, sensor: *, test_env: Test}>}
 */
async function run_cli() {
    let param_to_change, sensor_to_use, configs, execute_command, command_to_execute, sensor_config_to_use, test_env, test_env_to_use

    /**
     * Initialize the default configs and environments and print them
     */
    cli.list_default_parameter()
    cli.list_default_env()
    configs = cli.return_default_config()
    test_env = cli.return_default_env()

    // Ask the parameter to change
    param_to_change = (await cli.ask_parameter_to_change()).change_parameters

    // Change each parameter that was selected below
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

    // Choose the Test object containing the environments we want to use in the test
    test_env_to_use = (await cli.choose_test_env()).test_env_to_use
    test_env_to_use = test_env.find(test => { return test.toVary === test_env_to_use })

    // Instantiate the right sensor to use
    sensor_to_use = (await cli.ask_sensor_to_use()).sensor_to_use
    if (sensor_to_use === "infra red") {
        sensor_to_use = new IRSensor(configs.stm_ir_config.port, configs.stm_ir_config, "InfraRed")
        sensor_config_to_use = configs.stm_ir_config
    }
    if (sensor_to_use === "ultra sound") {
        sensor_to_use = new UltrasoundSensor(configs.ultrasound_config.port, configs.ultrasound_config, "Ultrasound")
        sensor_config_to_use = configs.ultrasound_config
    }

    return { config:configs.config, arduino_config:configs.arduino_config, sensor_config:sensor_config_to_use, sensor:sensor_to_use, test_env: test_env_to_use }
}

/**
 * The main function where the program start
 *
 * @returns {Promise<void>}
 */
async function main() {
    let timestamp
    let use_arduino
    let arduino_sensors
    let pass

    const { config, arduino_config, sensor_config, sensor, test_env} = await run_cli()
    do {
        
    } while (!(await cli.ask_to_run()).ask_start_test)

    // Instantiate the class arduino if the user wants to use the arduino to automate the tests
    use_arduino = (await cli.ask_to_use_arduino()).ask_use_arduino
    if (use_arduino)
        arduino_sensors = new ArduinoSensors(arduino_config.port, arduino_config)

    /**
     * For each environment to test, sample data in the right repository
     */
    for (let i = 0; i < test_env.environments.length; i++) {
        arduino_sensors !== undefined ? arduino_sensors.openPort() : ''

        timestamp = Date.now()
        arduino_sensors !== undefined ? pass = await checking(config, arduino_config, test_env, test_env.environments[i], arduino_sensors) : ''
        if (pass) {
            arduino_sensors.stop()
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

    console.log(colors.measurement(`Start drawing sheets from data`))
    execSync(`python3 drawSheet.py ${sensor_config["data repository"]} ${sensor_config["sheet repository"]} ${sensor.type}`)
    console.log(colors.measurement(`End drawing sheets from data`))
}

/**
 * Automate the test by waiting until the right value of the property that has to change is reached to start sample
 *
 * @param { object } config General configuration of the application
 * @param { object } arduino_config Actual configuration of the arduino
 * @param { module.Test } test_env
 * @param { module.Environment }env
 * @param { module.ArduinoSensors } arduino_sensors
 * @returns {Promise<*>}
 */
async function checking(config, arduino_config, test_env, env, arduino_sensors) {
    let checkable = [ "temperature", "humidity", "lux"]

    if (arduino_sensors === undefined) {
        await timer(config.timeout*1000)
        return
    }

    let value
    let finish = false
    let bar_timer
    let bar
    let pass

    if (checkable.includes(test_env.toVary)) {
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
    }
    else {
        console.log(colors.white(`\nYou have ${config.timeout} seconds to change the ${test_env.toVary} to ${ getValue(test_env, env) }. After that, the program will start collecting data`))
    }

    while (!finish) {
        switch (test_env.toVary) {
            case 'temperature':
                arduino_sensors.parser.pause()
                await timer(3*1000)
                value = arduino_sensors.parser.read(4)
                if (Number(value) <= env.temperature + Number(arduino_config["temperature imprecision"]) && Number(value) >= env.temperature - Number(arduino_config["temperature imprecision"])) {
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
                if (Number(value) <= Number(env.lux) + Number(arduino_config["lux imprecision"]) && Number(value) >= Number(env.lux) - Number(arduino_config["lux imprecision"])) {
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
                if (Number(value) <= Number(env.humidity) + Number(arduino_config["humidity imprecision"]) && Number(value) >= Number(arduino_config["humidity imprecision"])) {
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

/**
 * Wait a certain number of time before going to the next line of code.
 * To use with the keyword await (ex: await timer(500))
 *
 * @param { number } time The number of time to wait
 * @returns {Promise<any>}
 */
function timer(time) {
    return new Promise( (resolve, reject) => {
        setTimeout(()=>{
            resolve("finish")
        },time)
    })
}

/**
 * Return the value of the sensor that should vary in the test
 *
 * @param test_env
 * @param env
 * @returns {string | null}
 */
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

/**
 * START the program
 */
main().then(() => {
    console.log()
    console.log(colors.green.bold("All test are finished."))
    process.exit(0)
})