/** @typedef { import('./types').CliParams } CliParams */

const minimist = require('minimist')
const pkg = require('../package.json')
const { log } = require('./log')

module.exports = {
  getCliParams,
}

const minimistOpts = {
  boolean: ['help', 'version', 'anyAddress' ],
  string: ['port', 'address', 'deviceDir'],
  alias: {
    h: 'help',
    v: 'version',
    a: 'anyAddress',
    p: 'port',
    A: 'address',
    d: 'deviceDir'
  },
}

/** @type { (argv?: string[]) => CliParams } */
function getCliParams(argv) {
  if (!argv) argv = process.argv.slice(2)
  const args = minimist(argv, minimistOpts)

  if (args.help) help()
  if (args.version) version()

  if (args._.length !== 0) {
    log(`extraneous parameters ignored: ${JSON.stringify(args._)}`)
  }

  const port = args.port || process.env.PORT || 3000
  const address = args.address || (args.anyAddress ? '0.0.0.0' : '127.0.0.1')
  const deviceDirs = getDeviceDirs(args.deviceDir)

  return { port, address, deviceDirs }
}

/** @type { (arg: string | string[] | null | undefined) => string[] } */
function getDeviceDirs(arg) {
  if (!arg) return ['.']
  if (typeof arg === 'string') return [arg]
  return arg
}

function version() {
  console.log(pkg.version)
  process.exit(1)
}

function help() {
  console.log(`
${pkg.name} v${pkg.version}

options:
  -h --help
  -v --version
  -a --anyAddress
  -p --port <server port>
  -A --address <server address>
  -d --deviceDir <directory>

The PORT environment variable will be used if a port option is not provided.
The default port if not specified will be 3000.

The address is determined by the --anyAddress boolean flag, and the --address
option.  This will be the ip address the server binds to.  By default, it will
use 127.0.0.1, meaning the server can only be accessed on the same machine.  To
allow any machine to access the server, use the --anyAddress flag, which will
bind instead to 0.0.0.0.  Or you can bind to a specific address with the
--address fflag

The --deviceDir option indicates the name of the directory holding device .html
files.  The default is the current directory.  This option can be specified
multiple times.

The DEBUG environment variable can be set to anything for debug logging.

For more information, go to ${pkg.homepage}
`.trim())
  process.exit(1)
}

