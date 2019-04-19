const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const Ready = SerialPort.parsers.Ready
const fs = require('fs')
const Progress = require('progress')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const Sensor = require('./Sensor')

module.exports  = class IRSensor extends Sensor {

    constructor(path, config, type) {
        super(path, config, type)
    }

    // Start the measurement (open the port, add data in csv file)
    async start(config, config_sensor, test_env, env, timestamp) {
        if(this.port === undefined) {
            console.error("this.port is undefined")
            process.exit(1)
        }
        if(this.parser === undefined) {
            console.error("this.parser is undefined")
            process.exit(1)
        }
        this.port.open((err) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
        })

        const csvWriter = createCsvWriter({
            path: `${config_sensor.data_rep}/InfraRed_${timestamp}_${test_env.toVary}${env.temperature}.csv`,
            header: [
                {id: 'timestamp', title: 'TIMESTAMP'},
                {id: 'status', title: 'STATUS'},
                {id: 'distance', title: 'DISTANCE'},
                {id: 'signalRate', title: 'Signal Rate'},
                {id: 'ambientRate', title: 'Ambient Rate'}
            ]
        })
        const records = []
        await csvWriter.writeRecords(records)

        this.parser.on('data', (data) => {
            data = Date.now() + ", " + data
            let count = data.toString().split(',').length
            if (count !== 5) return
            data += "\n"
            // Start measurement algorithm (while tem != ...)
            //......

            /*let bar = new Progress('[:bar] :current secs/:total', {total: config.timeout})
            let timer = setInterval(() => {
                bar.tick()
                if (bar.complete) {
                    clearInterval(timer)
                }
            }, 1000)
            let checking = setInterval(() => {
                let promise = new Promise( (resolve, reject) => {
                    timer = setTimeout(()=>{
                        clearTimeout(clear)
                        resolve("finish")
                    },time)
                })
            }, 1000)*/
            fs.appendFile(`${config_sensor.data_rep}/InfraRed_${timestamp}_${test_env.toVary}${Sensor.getValue(test_env, env)}.csv`, data.toString(), (err) => {
                if (err) console.log(err)
            })
        })
    }

    parse() {
        return this.port.pipe(new Ready({ delimiter: '\n\r' })).pipe(new Readline({ delimiter: '\n\r' }))
    }
}
