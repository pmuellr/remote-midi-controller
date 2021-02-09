/** @typedef { import('./types').CreateMidiPortsParams } CreateMidiPortsParams */
/** @typedef { import('./types').MidiPort } MidiPort */

const midi = require('midi')

module.exports = {
  createMidiPort
}

/** @type { ({ name, onMessage }: CreateMidiPortsParams) => MidiPort } */
function createMidiPort({ name, onMessage }) {
  return new MidiPortImpl(name, onMessage)
}

class MidiPortImpl {
  /** 
   * @param { string } name 
   * @param { (deltaTime: number, message: number[]) => void } onMessage 
   * */
  constructor(name, onMessage) {
    this._name = name
    this._onMessage = onMessage

    this._iPort = new midi.Input()
    this._oPort = new midi.Output()

    this._iPort.on('message', (deltaTime, message) => {
      console.log(`input message: ${message} deltaTime: ${deltaTime}`)
      this._onMessage(deltaTime, message)
    })

    this._iPort.openVirtualPort(name)
    this._oPort.openVirtualPort(name)
  }

  get name() {
    return this._name
  }

  close() {
    this._iPort.closePort()
    this._oPort.closePort()
  }

/** @type { (bytes: number[]) => void } */
sendMessage(bytes) {
    this._oPort.sendMessage(bytes)
    console.log(`output message: ${bytes}`)
  }
}
