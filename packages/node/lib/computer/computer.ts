import { AxiosInstance } from 'axios';
import { Agent } from '../tools/agent';
import { Filesystem } from '../tools/filesystem';
import { Terminal } from '../tools/terminal';
import { Metrics } from '../types/agent';
import {
  ComputerDestroyedResponse,
  ComputerState,
  IComputer,
  InstanceType,
  Region,
  UpdateComputerOptions
} from '../types/computer';
import { ITemplate } from '../types/template';

export type ComputerCtor<T> = new (api: AxiosInstance, data: IComputer) => T;

export class Computer {
  protected readonly api: AxiosInstance;

  public readonly id: string;
  public readonly instanceId: string;
  public readonly instanceType: InstanceType;
  public readonly template: ITemplate;
  public readonly state: ComputerState;
  public readonly region: Region;
  public readonly inactivityTimeoutMs: number | null;
  public readonly autoDestroy: boolean;
  public readonly env: Record<string, string> | null;
  public readonly metadata: Record<string, string> | null;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  private readonly agent: Agent;
  public readonly fs: Filesystem;
  public readonly terminal: Terminal;

  constructor(api: AxiosInstance, data: IComputer) {
    this.api = api;

    this.id = data.id;
    this.instanceId = data.instance_id;
    this.instanceType = data.instance_type;
    this.template = data.template;
    this.state = data.state;
    this.region = data.region;
    this.inactivityTimeoutMs = data.inactivity_timeout_ms;
    this.autoDestroy = data.auto_destroy;
    this.env = data.env;
    this.metadata = data.metadata;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    this.agent = new Agent(data.template.slug, data.instance_id);
    this.fs = new Filesystem(data.template.slug, data.instance_id);
    this.terminal = new Terminal(data.template.slug, data.instance_id);
  }

  public async healthCheck(): Promise<boolean> {
    return this.agent.healthCheck();
  }

  public async getMetrics(): Promise<Metrics> {
    return this.agent.getMetrics();
  }

  public getHost(port: number): string {
    return `${this.template.slug}-${this.instanceId}-${port}.metallic.computer`;
  }

  public async start(): Promise<this> {
    const res = await this.api.post<IComputer>(`/computers/${this.id}/start`);
    return this._new(res.data);
  }

  public async stop(): Promise<this> {
    const res = await this.api.post<IComputer>(`/computers/${this.id}/stop`);
    return this._new(res.data);
  }

  public async update(opts: UpdateComputerOptions): Promise<this> {
    const res = await this.api.put<IComputer>(`/computers/${this.id}`, opts);
    return this._new(res.data);
  }

  public async waitForState(state: 'started' | 'stopped' | 'destroyed'): Promise<void> {
    await this.api.get<IComputer>(`/computers/${this.id}/wait?state=${state}`);
  }

  public async destroy(): Promise<ComputerDestroyedResponse> {
    const response = await this.api.delete<ComputerDestroyedResponse>(`/computers/${this.id}`);
    return response.data;
  }

  protected _new(data: IComputer): this {
    const Ctor = this.constructor as ComputerCtor<this>;
    return new Ctor(this.api, data);
  }
}
