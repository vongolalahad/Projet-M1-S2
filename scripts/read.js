const SerialPort = require('serialport')
const Ready = SerialPort.parsers.Ready
const ByteLength = SerialPort.parsers.ByteLength


port = new SerialPort('/dev/ttyACM0', { autoOpen: false })

parser = port.pipe(new Ready({ delimiter: new Buffer([0x0a]) })).pipe(new ByteLength({ length: 32 }))

port.open(err => {
    if (err) console.log(err)
})

port.on('open', () => {
    //parser.pause()
})

// Faire un read sur le port pour voir ce que ça va donner

parser.on('data', data => {
    console.log(data)
})


/// Test the paused mode
//this.port.pause()   // paused mode
function timer(time) {
    return new Promise( (resolve, reject) => {
        setTimeout(()=>{
            resolve("finish")
        },time)
    })
}
async function main(parser) {
    await timer(20000)
    parser.read(6)

}


//main(parser)