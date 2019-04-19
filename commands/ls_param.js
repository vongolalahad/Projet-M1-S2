'use strict'

require('colors').setTheme({
    title: "blue",
    subtitle: "green",
    key: "white",
    value: "yellow",
    measurement: ["white", "bold"]
})
const colors = require('colors/safe')

/**
 * list all test's environments
 */

module.exports = {
    name: "ls_param",
    description: "List current values of parameters",
    execute: function (test_env, configs) {
        let i = 0
        console.log(
`
${colors.title("==================== Parameters ====================")}

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
        console.log(
            `
${colors.title("==================== Environments ==========================")}
`
        )
        test_env.environments.forEach(test => {
            console.log(
                `${colors.gray.bold(`===== Test on different ${test.toVary}`)}
`
            )
            test.environments.forEach(environment => {
                console.log(
                    `      ${colors.key(`Environment ${++i}:`)} ${colors.value(environment.toString())}
`
                )
            })
        })
    }
}