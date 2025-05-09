import { AxiosInstance } from 'axios';
import { Computer } from '../computer/computer';
import { ComputerWithBrowser } from '../computer/computer-with-browser';
import { ComputerWithCodeInterpreter } from '../computer/computer-with-code-interpreter';
import {
  ComputerDestroyedResponse,
  CreateComputerOptions,
  IComputer,
  ListComputersOptions,
  ListComputersResponse,
  UpdateComputerOptions
} from '../types/computer';
import { BaseTemplate, BaseTemplateMap } from '../types/template';

export type ComputerFor<T extends BaseTemplate> = T extends keyof BaseTemplateMap ? BaseTemplateMap[T] : Computer;

export class ComputerClient {
  constructor(private readonly api: AxiosInstance) {}

  // Concrete overloads for the built‑in templates
  public async create(options: CreateComputerOptions & { template: 'metallic-browser' }): Promise<ComputerWithBrowser>;
  public async create(
    options: CreateComputerOptions & { template: 'metallic-code-interpreter' }
  ): Promise<ComputerWithCodeInterpreter>;
  public async create(options: CreateComputerOptions & { template: 'metallic-base' }): Promise<Computer>;

  /**
   * Generic overload: call‑site supplies a *base* template slug through the
   * type parameter `T`, while the runtime `template` field can be **any**
   * string (e.g. a forked template that ultimately derives from that base).
   */
  public async create<T extends BaseTemplate>(
    options: CreateComputerOptions & { template: string }
  ): Promise<ComputerFor<T>>;

  /** No template provided — backend decides. */
  public async create(options?: Omit<CreateComputerOptions, 'template'>): Promise<Computer>;

  // ––– single implementation –––
  public async create<T extends BaseTemplate = BaseTemplate>(
    options: CreateComputerOptions = {} as CreateComputerOptions
  ): Promise<ComputerFor<T>> {
    const res = await this.api.post<IComputer>('/computers', options);
    return this.createComputerInstance(res.data) as ComputerFor<T>;
  }

  public async list(options?: ListComputersOptions): Promise<ListComputersResponse> {
    const res = await this.api.get<ListComputersResponse>('/computers', { params: options });
    return res.data;
  }

  public async get<T extends BaseTemplate = BaseTemplate>(id: string): Promise<ComputerFor<T>> {
    const res = await this.api.get<IComputer & { template: { base_template: T } }>(`/computers/${id}`);
    return this.createComputerInstance<T>(res.data);
  }

  public async start<T extends BaseTemplate = BaseTemplate>(id: string): Promise<ComputerFor<T>> {
    const res = await this.api.post<IComputer & { template: { base_template: T } }>(`/computers/${id}/start`);
    return this.createComputerInstance<T>(res.data);
  }

  public async stop<T extends BaseTemplate = BaseTemplate>(id: string): Promise<ComputerFor<T>> {
    const res = await this.api.post<IComputer & { template: { base_template: T } }>(`/computers/${id}/stop`);
    return this.createComputerInstance<T>(res.data);
  }

  public async update<T extends BaseTemplate = BaseTemplate>(
    id: string,
    options: UpdateComputerOptions
  ): Promise<ComputerFor<T>> {
    const res = await this.api.put<IComputer & { template: { base_template: T } }>(`/computers/${id}`, options);
    return this.createComputerInstance<T>(res.data);
  }

  private createComputerInstance<T extends BaseTemplate = BaseTemplate>(
    data: IComputer & { template: { base_template: T } }
  ): ComputerFor<T> {
    switch (data.template.base_template) {
      case 'metallic-browser':
        return new ComputerWithBrowser(this.api, data) as ComputerFor<T>;
      case 'metallic-code-interpreter':
        return new ComputerWithCodeInterpreter(this.api, data) as ComputerFor<T>;
      default:
        return new Computer(this.api, data) as ComputerFor<T>;
    }
  }

  public async destroy(id: string): Promise<ComputerDestroyedResponse> {
    const response = await this.api.delete<ComputerDestroyedResponse>(`/computers/${id}`);
    return response.data;
  }
}
