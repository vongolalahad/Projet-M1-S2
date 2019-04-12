'use strict'

require('colors').setTheme({
    title: "blue",
    subtitle: "green",
    key: "white",
    value: "yellow"
})
const colors = require('colors/safe')

/**
 * list all test's environments
 */

module.exports = {
    name: "ls_env",
    description: "List available environments",
    execute: function (env) {
        let i = 0
        console.log(
            `
${colors.title("==================== Environments ==========================")}
`
        )
        env.forEach(environment => {
            console.log(
                `${colors.key(`Environment ${++i}:`)} ${colors.value(environment.toString())}
`
            )
        })
    }
}