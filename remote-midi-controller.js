#!/usr/bin/env node

/** @typedef { import('fastify').FastifyInstance } FastifyInstance */
/** @typedef { import('./lib/types').CliParams } CliParams */

const path = require('path')

const Fastify = require('fastify')
const FastifyStatic = require('fastify-static')

const pkg = require('./package.json')
const { log } = require('./lib/log')
const { getCliParams } = require('./lib/cli-params')
const { createMidiPort } = require('./lib/midi-port')

/** @type { FastifyInstance } */
// @ts-ignore
const server = Fastify()

const cliParams = getCliParams(null) // ts error? must provide param! ew!
// console.log('params', cliParams)

// @ts-ignore
server.register(require('fastify-websocket'))

// @ts-ignore
server.register(FastifyStatic, {
  root: path.join(__dirname, 'web')
})

const echoMidiPortName = `${pkg.name} echo`
registerMidiDevice(server, echoMidiPortName)

start(server, cliParams)

/** @type { (server: FastifyInstance, name: string) => void } */
function registerMidiDevice(server, name) {
  const connections = new Set()
  const echoMidiPort = createMidiPort({ name, onMessage })

  server.get(`/midi/${name}`, { websocket: true }, (connection, req) => {
    connections.add(connection)

    connection.socket.on('message', message => {
      const stringMessage = message.toString('utf-8')
      const midiMessage = getMessageFromWebSocket(stringMessage)
      if (midiMessage == null) return
      if (midiMessage.length === 0) return

      echoMidiPort.sendMessage(midiMessage)
    })

    connection.socket.on('close', () => {
      connections.delete(connection)
    })
  })

  /** @type { (deltaTime: number, message: number[]) => void } */
  function onMessage(deltaTime, message) {
    for (const connection of connections) {
      connection.socket.send(JSON.stringify(message))
    }
  }
}


/** @type { (req: Fastify.FastifyRequest, rep: Fastify.FastifyReply) => Promise<void> } */
async function handleHomePage(req, rep) {
  rep
    .code(200)
    .header('Content-Type', 'text/html; charset=utf-8')
    .send('<h1>hello, world</h1>')
}

/** @type { (server: FastifyInstance, cliParams: CliParams) => Promise<void> } */
async function start(server, cliParams) {
  log('use the -h or --help options for help')
  try {
    const address = await server.listen(cliParams.port, cliParams.address)
    log(`server started at url: ${address}`)    
  } catch (err) {
    log(`server error: ${err}`)
    process.exit(1)
  }
}

/** @type { (string: string) => number[] | undefined } */
function getMessageFromWebSocket(string) {
  let parsed
  try {
    parsed = JSON.parse(string)
  } catch (err) {
    log(`invalid JSON websocket message: ${string}`)
    return
  }

  if (!Array.isArray(parsed)) {
    log(`invalid non-array websocket message: ${string}`)
    return
  }

  for (const element of parsed) {
    if (typeof element !== 'number') {
      log(`invalid non-numeric array element in websocket message: ${string}`)
      return
    }
  }

  return parsed
}
