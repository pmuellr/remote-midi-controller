'use strict'

module.exports = {
  log
}

const DEBUG = !!process.env.DEBUG 

const pkg = require('../package.json')

/** @type { (message: string) => void } */
function log(message) {
  console.log(`${pkg.name}: ${message}`)
}

/** @type { (message: string) => void } */
function logDebug(message) {
  if (!DEBUG) return
  log(message)
}

/** @type { (message: string) => void } */
function logExitError(message) {
  log(message)
  process.exit(1)
}

log.debug = logDebug
log.exitError = logExitError
