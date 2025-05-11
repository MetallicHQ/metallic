import { AxiosInstance } from 'axios';
import { Computer } from '../computer';
import {
  ComputerDestroyedResponse,
  CreateComputerOptions,
  IComputer,
  ListComputersOptions,
  ListComputersResponse,
  UpdateComputerOptions
} from '../types/computer';

export class ComputerClient {
  constructor(private readonly api: AxiosInstance) {}

  public async create(options?: CreateComputerOptions): Promise<Computer> {
    const res = await this.api.post<IComputer>('/computers', options);
    return new Computer(this.api, res.data);
  }

  public async list(options?: ListComputersOptions): Promise<ListComputersResponse> {
    const res = await this.api.get<ListComputersResponse>('/computers', { params: options });
    return res.data;
  }

  public async get(id: string): Promise<Computer> {
    const res = await this.api.get<IComputer>(`/computers/${id}`);
    return new Computer(this.api, res.data);
  }

  public async start(id: string): Promise<Computer> {
    const res = await this.api.post<IComputer>(`/computers/${id}/start`);
    return new Computer(this.api, res.data);
  }

  public async stop(id: string): Promise<Computer> {
    const res = await this.api.post<IComputer>(`/computers/${id}/stop`);
    return new Computer(this.api, res.data);
  }

  public async update(id: string, options: UpdateComputerOptions): Promise<Computer> {
    const res = await this.api.put<IComputer>(`/computers/${id}`, options);
    return new Computer(this.api, res.data);
  }

  public async destroy(id: string): Promise<ComputerDestroyedResponse> {
    const response = await this.api.delete<ComputerDestroyedResponse>(`/computers/${id}`);
    return response.data;
  }
}
