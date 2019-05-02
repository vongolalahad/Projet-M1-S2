/**
 *
 * cli ls_param
 *
 * List current parameters of the program
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

/**
 * list all test's environments
 */

module.exports = {
    /**
     * The name of the command
     */
    name: "ls_param",
    /**
     * The description of the command
     */
    description: "List current values of parameters",
    execute: function (test_env, configs) {
        let i = 0
        console.log(
`
${colors.title("==================== Parameters ====================")}

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
        Object.entries(configs.arduino_config).forEach(entry => {
            console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
            )
        })
        console.log(
`
${colors.subtitle("===== Infra red sensor config")}`
        )
        Object.entries(configs.stm_ir_config).forEach(entry => {
            console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
            )
        })
        console.log(
`
${colors.subtitle("===== Ultra sound sensor config")}`
        )
        Object.entries(configs.ultrasound_config).forEach(entry => {
            console.log(
`      ${colors.key(`${entry[0].padEnd(20, ' ')}`)}\t\t ${colors.value(`${entry[1]}`)}`
            )
        })
    }
}