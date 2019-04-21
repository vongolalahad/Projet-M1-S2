/**
 * cli rm_env
 *
 * Allow the user to remove one or more environments
 *
 */

const inquirer = require('inquirer')
const colors = require('colors/safe')

async function ask_env_to_remove(test_env) {
    let environments = []
    let ids = []
    test_env.forEach(test => {
        environments.push(new inquirer.Separator(`${colors.bgWhite.bold.black(`== ${test.toVary.padEnd(12, ' ')}`)}`))
        test.environments.forEach(env => {
            environments.push(env.toString())
        })
    })
    let result = (await inquirer.prompt([
        {
            type: "checkbox",
            name: "env_to_remove",
            message: "Select the environments you want to remove ",
            choices: environments
        }
    ])).env_to_remove
    result.forEach(env => {
        ids.push(parseInt(env.split("id=")[1]))
    })
    return ids
}

/**
 *
 *
 * @type {{name: string, description: string, execute: module.exports.execute}}
 */
module.exports = {
    name: "rm_env",
    description: "remove one or more environments",
    execute: async function (test_env) {
        let ids = (await ask_env_to_remove(test_env))

        for (let test of test_env) {
            test.environments = test.environments.filter(env => {
                return !ids.includes(env.id)
            })
        }
    }
}