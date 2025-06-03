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
  ComputerStartOptions,
  ComputerState,
  IComputer
} from './types/computer';
import { Region } from './types/shared';

export class Computer extends ApiClient {
  public readonly id: string;
  public readonly instanceId: string;
  public readonly template: string;
  public readonly state: ComputerState;
  public readonly region: Region;
  public readonly ttlSeconds: number | null;
  public readonly autoDestroy: boolean;
  public readonly metadata: Record<string, string> | null;
  private readonly agent: AgentTool;
  public readonly fs: FilesystemTool;
  public readonly terminal: TerminalTool;
  public readonly browser: BrowserTool;

  constructor(options: ComputerConstructorOptions) {
    super(options);
    this.id = options.id;
    this.instanceId = options.instance_id;
    this.template = options.template;
    this.state = options.state;
    this.region = options.region;
    this.ttlSeconds = options.ttl_seconds;
    this.autoDestroy = options.auto_destroy;
    this.metadata = options.metadata;
    this.agent = new AgentTool(options.template, options.instance_id);
    this.fs = new FilesystemTool(options.template, options.instance_id);
    this.terminal = new TerminalTool(options.template, options.instance_id);
    this.browser = new BrowserTool(options.template, options.instance_id);
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
    await this.api.post<IComputer>(`/computers/${this.id}/stop`);
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
    await this.api.get(`/computers/${this.id}/wait?state=${state}`);
  }

  /**
   * Destroy the computer.
   */
  public async destroy(): Promise<void> {
    await this.api.delete(`/computers/${this.id}`);
  }
}
