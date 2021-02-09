export interface CliParams {
  // tcp port for server
  port: number

  // tcp address for server; default localhost, 0.0.0.0 for any interface
  address: string

  // directories containing device .html files
  deviceDirs: string[]
}

export interface WebDevice {
  name: string;
  dir: string;
}

export interface MidiPort {
  readonly name: string;
  close(): void
  sendMessage(bytes: number[]): void
}

export interface CreateMidiPortsParams {
  name: string
  onMessage: (deltaTime: number, message: number[]) => void
}
