const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength


port = new SerialPort(path, { baudRate: config.baudRate, autoOpen: false })

parser = port.pipe(new Ready({ delimiter: new Buffer([0x0a]) })).pipe(new ByteLength({ length: 30 }))

port.open(err => {
    if (err) console.log(err)
})

// Faire un read sur le port pour voir ce que ça va donner

parser.on('data', data => {
    console.log(data)
})


/// Test the paused mode
//this.port.pause()   // paused mode