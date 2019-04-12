"use strict"

const colors = require("colors/safe")
const cli = require('./cli')
const IRSensor = require('./sensor/IRSensor')
const UltrasoundSensor = require('./sensor/UltrasoundSensor')
const ArduinoSensors = require('./sensor/ArduinoSensors')

// return object : {config.config, config.arduino, config.stm32_IR, config.stm32ultra, sensor_used(object of the class)}
async function run_cli() {
    let param_to_change, sensor_to_use, configs, execute_command, command_to_execute, sensor_config_to_use, env

    cli.list_default_parameter()
    cli.list_default_env()
    configs = cli.return_default_config()
    env = cli.return_default_env()

    param_to_change = (await cli.ask_parameter_to_change()).change_parameters

    if (param_to_change.includes("Ports"))
        configs = await cli.change_ports(configs)

    if (param_to_change.includes("Baud Rates"))
        configs = await cli.change_baud_rates(configs)

    execute_command = (await cli.ask_exec_command()).ask_execute_command
    if (execute_command) {
        command_to_execute = (await cli.command_to_execute()).command_to_exec
        cli.exec_command(command_to_execute, env)
        while ((await cli.ask_exec_another_command()).ask_execute_command) {
            command_to_execute = (await cli.command_to_execute()).command_to_exec
            cli.exec_command(command_to_execute, env)
        }
    }

    sensor_to_use = (await cli.ask_sensor_to_use()).sensor_to_use
    if (sensor_to_use === "Infra red") {
        sensor_to_use = new IRSensor(configs.stm_ir_config.port, configs.stm_ir_config)
        sensor_config_to_use = configs.stm_ir_config
    }
    if (sensor_to_use === "Ultra sound") {
        sensor_to_use = new UltrasoundSensor(configs.stm_ultrasound_config, configs.stm_ultrasound_config)
        sensor_config_to_use = configs.stm_ultrasound_config
    }

    return { config:configs.config, arduino_config:configs.arduino_config, sensor_config:sensor_config_to_use, sensor:sensor_to_use, env: env }
}

async function main() {
    let timestamp

    const { config, arduino_config, sensor_config, sensor, env} = await run_cli()
    do {
        
    } while (!(await cli.ask_to_run()).ask_start_test)
    //let sens = new IRSensor("/dev/ttyACM0", { baudRate: 115200 })
    let arduino_sensors = new ArduinoSensors()
    env.forEach(environment => {
        timestamp = Date.now()
        sensor.start(config, sensor_config, environment, timestamp)
        arduino_sensors.start(arduino_config, timestamp)
    })
}

main()