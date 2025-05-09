import axios, { AxiosInstance } from 'axios';
import { ComputerClient } from './clients/computer';
import { TemplateClient } from './clients/template';
import { transformAxiosError } from './utils/error';

export interface MetallicOptions {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class Metallic {
  private readonly api: AxiosInstance;
  public readonly computers: ComputerClient;
  public readonly templates: TemplateClient;

  constructor(apiKey?: string, options: MetallicOptions = {}) {
    const key = apiKey ?? process.env['METALLIC_API_KEY'];
    if (!key) {
      throw new Error('METALLIC_API_KEY is not set');
    }

    const baseURL = options.baseUrl ?? process.env['METALLIC_BASE_URL'] ?? 'https://api.metallic.dev/v1';
    const timeout = options.timeout ?? 60000;

    this.api = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${key}`,
        ...(options.headers ?? {})
      }
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(transformAxiosError(error));
      }
    );

    this.computers = new ComputerClient(this.api);
    this.templates = new TemplateClient(this.api);
  }
}
