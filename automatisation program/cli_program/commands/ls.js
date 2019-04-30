/**
 * cli ls
 * list available commands
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
const fs = require('fs')
const path = require('path')
const commandFiles = fs.readdirSync(`${path.dirname(fs.realpathSync(__filename))}`).filter(file => file.endsWith('.js') && file !== "ls.js")
let commands = new Map()
for (const file of commandFiles) {
    const command = require(`${path.dirname(fs.realpathSync(__filename))}/${file}`)
    commands.set(command.name, command)
}

module.exports = {
    /**
     * The name of the command
     */
    name: "ls",
    /**
     * The description of the command
     */
    description: "list all the available commands and their description",
    execute: function () {
        let iterator = commands.keys()
        let name
        console.log(
`
${colors.title("==================== Commands available ====================")}
`
        )
        console.log(
`${colors.key(`${this.name}`.padEnd(10, ' '))}\t\t\t${colors.value(`${this.description}`)}`
        )
        while ((name = iterator.next().value) !== undefined) {
            console.log(`${colors.key(`${name.padEnd(10, ' ')}`)}\t\t\t${colors.value(`${commands.get(name).description}`)}`)
        }
        console.log()
    }
}