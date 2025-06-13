import { ApiClient } from './api';
import { AgentTool } from './tools/agent';
import { BrowserTool } from './tools/browser';
import { FilesystemTool } from './tools/fs';
import { TerminalTool } from './tools/terminal';
import { Metrics } from './types/agent';
import {
  ComputerConnectOptions,
  ComputerConstructorOptions,
  ComputerCreateOptions,
  ComputerForkOptions,
  ComputerStartOptions,
  ComputerState,
  IComputer
} from './types/computer';
import { Region } from './types/shared';

export class Computer extends ApiClient {
  public readonly id: string;
  public readonly template: string;
  public readonly region: Region;
  public readonly ttlSeconds: number | null;
  public readonly autoDestroy: boolean;
  public readonly metadata: Record<string, string> | null;
  private readonly agent: AgentTool;
  public readonly fs: FilesystemTool;
  public readonly terminal: TerminalTool;
  public readonly browser: BrowserTool;
  private _state: ComputerState;

  public get state(): ComputerState {
    return this._state;
  }

  constructor(options: ComputerConstructorOptions) {
    super(options);
    this.id = options.id;
    this.template = options.template;
    this.region = options.region;
    this.ttlSeconds = options.ttl_seconds;
    this.autoDestroy = options.auto_destroy;
    this.metadata = options.metadata;
    this._state = options.state;

    this.agent = new AgentTool(options.project_id, options.instance_id);
    this.fs = new FilesystemTool(options.project_id, options.instance_id);
    this.terminal = new TerminalTool(options.project_id, options.instance_id);
    this.browser = new BrowserTool(options.project_id, options.instance_id);
  }

  private _setState(next: ComputerState) {
    this._state = next;
  }

  /**
   * Check the health of the computer.
   *
   * @returns true if the computer is healthy, false otherwise.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * const isHealthy = await computer.healthCheck()
   * ```
   */
  public async healthCheck(): Promise<boolean> {
    return this.agent.healthCheck();
  }

  /**
   * Get the metrics of the computer.
   *
   * @returns metrics of the computer.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * await computer.waitForState('started')
   * const metrics = await computer.getMetrics()
   * ```
   */
  public async getMetrics(): Promise<Metrics> {
    return this.agent.getMetrics();
  }

  /**
   * Get the host address for the specified computer port. You can use this secure address to connect to the computer port from outside the computer via HTTP or WebSocket.
   *
   * @param port number of the port in the computer.
   *
   * @returns host address of the computer port.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * // Start an HTTP server
   * await computer.terminal.run('python -m http.server 3000')
   * // Get the hostname of the HTTP server
   * const serverURL = await computer.getHost(3000)
   * ```
   */
  public async getHost(port: number): Promise<string> {
    return this.agent.getHost(port);
  }

  /**
   * Create a new computer.
   *
   * @param options computer create options.
   *
   * @returns computer instance for the new computer.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * ```
   * @constructs Computer
   */
  public static async create(options?: ComputerCreateOptions): Promise<Computer> {
    const { template, ttlSeconds, region, autoDestroy, env, metadata, ...rest } = options ?? {};

    const client = new ApiClient(rest);
    const res = await client.api.post<IComputer>('/computers', {
      template,
      region,
      ttl_seconds: ttlSeconds,
      auto_destroy: autoDestroy,
      env,
      metadata
    });

    return new Computer({ ...res.data, ...rest });
  }

  /**
   * Start an existing computer.
   *
   * @param computerId computer ID.
   * @param options computer start options.
   *
   * @returns computer instance.
   *
   * @example
   * ```ts
   * const computer = await Computer.start("com_1a2b3c")
   * ```
   * @constructs Computer
   */
  public static async start(computerId: string, options?: ComputerStartOptions): Promise<Computer> {
    const client = new ApiClient(options);
    const res = await client.api.post<IComputer>(`/computers/${computerId}/start`);
    return new Computer({ ...res.data, ...(options ?? {}) });
  }

  /**
   * Stop the computer.
   */
  public async stop(): Promise<void> {
    const res = await this.api.post<IComputer>(`/computers/${this.id}/stop`);
    this._setState(res.data.state);
  }

  /**
   * Connect to an existing computer. Use the computer ID to connect to the same computer from different places or environments (serverless functions, etc).
   *
   * @param computerId computer ID.
   * @param options computer connect options.
   *
   * @returns computer instance.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * const computerId = computer.id
   *
   * // Connect to the same computer
   * const sameComputer = await Computer.connect(computerId)
   * ```
   * @constructs Computer
   */
  public static async connect(computerId: string, options?: ComputerConnectOptions): Promise<Computer> {
    const client = new ApiClient(options);
    const res = await client.api.post<IComputer>(`/computers/${computerId}/connect`);
    return new Computer({ ...res.data, ...(options ?? {}) });
  }

  /**
   * Fork an existing computer.
   *
   * @param computerId computer ID.
   * @param options computer fork options.
   *
   * @returns computer instance.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * const forkedComputer = await computer.fork()
   * ```
   * @constructs Computer
   */
  public async fork(computerId: string, options?: ComputerForkOptions): Promise<Computer> {
    const client = new ApiClient(options);
    const res = await client.api.post<IComputer>(`/computers/${computerId}/fork`);
    return new Computer({ ...res.data, ...(options ?? {}) });
  }

  /**
   * Wait for the computer to reach a specific state.
   *
   * @param state state to wait for.
   *
   * @example
   * ```ts
   * const computer = await Computer.create()
   * await computer.waitForState('started')
   * ```
   */
  public async waitForState(state: 'started' | 'stopped' | 'destroyed'): Promise<void> {
    const res = await this.api.get<{
      success: true;
      state: 'started' | 'stopped' | 'destroyed';
    }>(`/computers/${this.id}/wait?state=${state}`);
    this._setState(res.data.state);
  }

  /**
   * Destroy the computer.
   */
  public async destroy(): Promise<void> {
    const res = await this.api.delete<IComputer>(`/computers/${this.id}`);
    this._setState(res.data.state);
  }
}
