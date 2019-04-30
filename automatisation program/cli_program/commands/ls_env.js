/**
 * cli ls_env
 *
 * List all environments in the running program
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

module.exports = {
    /**
     * The name of the command
     */
    name: "ls_env",
    /**
     * The description of the command
     */
    description: "List available environments",
    execute: function (test_env) {
        let i = 0
        console.log(
            `
${colors.title("==================== Environments ==========================")}
`
        )
        test_env.forEach(test => {
            console.log(
`${colors.gray.bold(`===== Test on different ${test.toVary}`)}
`
            )
            test.environments.forEach(environment => {
                console.log(
`      ${colors.key(`Environment ${++i}:`)} ${colors.value(environment)}
`
                )
            })
        })
    }
}