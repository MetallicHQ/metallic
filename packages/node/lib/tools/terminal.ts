import { ClientReadableStream } from '@grpc/grpc-js';
import { ProcessEvent, ProcessInfo } from '../generated/terminal';
import { TerminalService } from '../services/terminal';
import { CommandResult, ConnectToProcessOptions, RunCommandOptions } from '../types/terminal';

export class TerminalTool {
  private readonly terminalService: TerminalService;

  constructor(template: string, instanceId: string) {
    this.terminalService = new TerminalService(template, instanceId);
  }

  /**
   * Runs a command and waits until it finishes executing
   * @param cmd Command to execute
   * @param options Options for running the command
   * @returns Command result
   */
  async run(cmd: string, options?: RunCommandOptions & { background?: false }): Promise<CommandResult>;

  /**
   * Runs a command in the background
   * @param cmd Command to execute
   * @param options Options for running the command
   * @returns Process handle
   */
  async run(cmd: string, options?: RunCommandOptions & { background?: true }): Promise<ProcessHandle>;

  // Implementation for all overloads
  async run(cmd: string, options?: RunCommandOptions) {
    const stream = this.terminalService.spawnProcess({
      cmd: '/bin/bash',
      args: ['-l', '-c', cmd],
      cwd: options?.cwd || '/',
      env: options?.env || {},
      cols: options?.cols || 80,
      rows: options?.rows || 24
    });

    const pid = await TerminalTool.waitForPid(stream);

    const handle = new ProcessHandle(
      pid,
      stream,
      this.terminalService,
      options?.onData,
      options?.onExit,
      options?.onError,
      options?.timeoutMs
    );

    if (!options?.background) {
      return handle.wait();
    }

    return handle;
  }

  /**
   * List all running processes
   * @returns Array of process information
   */
  async listProcesses(): Promise<ProcessInfo[]> {
    const response = await this.terminalService.listProcesses({});
    return response.processes;
  }

  /**
   * Connect to a running process
   * @param pid Process ID to connect to
   * @returns Process handle
   */
  connect(pid: number, options?: ConnectToProcessOptions): ProcessHandle {
    const stream = this.terminalService.connectToProcess({ pid });
    return new ProcessHandle(
      pid,
      stream,
      this.terminalService,
      options?.onData,
      options?.onExit,
      options?.onError,
      options?.timeoutMs
    );
  }

  private static waitForPid(stream: ClientReadableStream<ProcessEvent>): Promise<number> {
    return new Promise((resolve, reject) => {
      stream.on('data', (event: ProcessEvent) => {
        if (event.type === 'START') {
          resolve(event.pid);
        } else if (event.type === 'ERROR') {
          reject(new Error(event.error));
        } else if (event.type === 'EXIT') {
          reject(new Error('Process killed before starting'));
        }
      });
      stream.on('error', (err) => {
        reject(err);
      });
      stream.on('end', () => {
        reject(new Error('Process killed before starting'));
      });
    });
  }
}

export class ProcessHandle {
  private _data: string;
  private _result: CommandResult | null;
  private _wait: Promise<void>;
  private _timeoutId: NodeJS.Timeout | null;
  private readonly decoder: TextDecoder;

  constructor(
    readonly pid: number,
    private readonly stream: ClientReadableStream<ProcessEvent>,
    private readonly terminalService: TerminalService,
    private readonly onData?: (data: string) => void | Promise<void>,
    private readonly onExit?: (exitCode: number) => void | Promise<void>,
    private readonly onError?: (error: Error) => void | Promise<void>,
    private readonly timeoutMs?: number,
    private readonly encoding: BufferEncoding = 'utf-8'
  ) {
    this._data = '';
    this._result = null;
    this._timeoutId = null;
    this.decoder = new TextDecoder(encoding, { fatal: false });
    this._wait = this.handleStream();
  }

  get data(): string {
    return this._data;
  }

  get exitCode(): number | null {
    return this._result ? this._result.exitCode : null;
  }

  private clearTimeout() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  private handleStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.timeoutMs) {
        this._timeoutId = setTimeout(() => {
          const error = new Error(`Command timed out after ${this.timeoutMs}ms`);
          if (this.onError) {
            this.onError(error);
          }
          reject(error);
          this.kill('SIGTERM');
        }, this.timeoutMs);
      }

      this.stream.on('data', (event: ProcessEvent) => {
        if (event.type === 'DATA') {
          const data = this.decoder.decode(event.data);
          this._data += data;
          if (this.onData) {
            this.onData(data);
          }
        } else if (event.type === 'EXIT') {
          this.clearTimeout();
          this._result = {
            exitCode: event.exitCode,
            data: this._data
          };
          if (this.onExit) {
            this.onExit(event.exitCode);
          }
          resolve();
        } else if (event.type === 'ERROR') {
          this.clearTimeout();
          const error = new Error(event.error);
          if (this.onError) {
            this.onError(error);
          }
          reject(error);
        }
      });
      this.stream.on('error', (err) => {
        this.clearTimeout();
        if (this.onError) {
          this.onError(err);
        }
        reject(err);
      });
      this.stream.on('end', () => {
        this.clearTimeout();
        if (this._result) {
          if (this.onExit) {
            this.onExit(this._result.exitCode);
          }
          resolve();
        } else {
          const err = new Error('Process exited without a result');
          if (this.onError) {
            this.onError(err);
          }
          reject(err);
        }
      });
    });
  }

  /**
   * Wait for the process to finish executing
   * @returns Command result
   */
  public async wait(): Promise<CommandResult> {
    await this._wait;
    if (this._result) {
      return this._result;
    }
    throw new Error('Process exited without a result');
  }

  /**
   * Write data to the command's process
   * @param data Data to write
   */
  public async write(data: string | Buffer): Promise<void> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, this.encoding);
    await this.terminalService.sendInput({ pid: this.pid, input: buffer });
  }

  /**
   * Resize the process's terminal
   * @param cols Number of columns
   * @param rows Number of rows
   */
  public async resize(cols: number, rows: number): Promise<void> {
    await this.terminalService.updateProcess({ pid: this.pid, cols, rows });
  }

  /**
   * Kill the process
   * @param signal Signal to send to the process
   */
  public async kill(signal = 'SIGTERM'): Promise<void> {
    await this.terminalService.sendSignal({ pid: this.pid, signal });
  }
}
