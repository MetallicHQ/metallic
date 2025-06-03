import axios, { AxiosInstance } from 'axios';
import { ApiClientOptions } from './types/api';
import { MetallicError, RateLimitError } from './utils/error';

export class ApiClient {
  readonly api: AxiosInstance;

  constructor(options: ApiClientOptions = {}) {
    const key = options.apiKey ?? process.env['METALLIC_API_KEY'];
    if (!key) {
      throw new MetallicError('METALLIC_API_KEY is not set');
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
        return Promise.reject(ApiClient.transformError(error));
      }
    );
  }

  private static transformError(error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const message = data?.message || `Request failed with status ${status}`;

        if (status === 429) {
          return new RateLimitError(message);
        }

        return new MetallicError(message);
      } else if (error.request) {
        return new MetallicError('No response from server. Check your connection.');
      } else {
        return new MetallicError(`Request setup error: ${error.message}`);
      }
    }

    return new MetallicError('An unknown error occurred.');
  }
}
