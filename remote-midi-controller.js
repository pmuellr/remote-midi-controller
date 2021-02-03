#!/usr/bin/env node

/** @typedef { import('fastify').FastifyInstance } FastifyInstance */
/** @typedef { import('./lib/types').CliParams } CliParams */

const Fastify = require('fastify')
const { getCliParams } = require('./lib/cli-params')

/** @type { FastifyInstance } */
// @ts-ignore
const server = Fastify()

const cliParams = getCliParams(null) // ts error? must provide param! ew!
// console.log('params', cliParams)

// Declare a route
server.get('/', handleHomePage)

start(cliParams)

/** @type { (req: Fastify.FastifyRequest, rep: Fastify.FastifyReply) => Promise<void> } */
async function handleHomePage(req, rep) {
  rep
    .code(200)
    .header('Content-Type', 'text/html; charset=utf-8')
    .send('<h1>hello, world</h1>')
}

/** @type { (cliParams: CliParams) => Promise<void> } */
async function start(cliParams) {
  try {
    const address = await server.listen(cliParams.port, cliParams.address)
    console.log(`server started at url:`, address)    
  } catch (err) {
    console.log(`server error:`, err)
    process.exit(1)
  }
}
