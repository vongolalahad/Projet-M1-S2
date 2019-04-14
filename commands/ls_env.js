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
    name: "ls_env",
    description: "List available environments",
    execute: function (test_env) {
        let i = 0
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