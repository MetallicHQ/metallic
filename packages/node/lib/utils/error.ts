import axios from 'axios';

export class MetallicError extends Error {
  statusCode: number | undefined;
  rawError: any;

  constructor(message: string, statusCode?: number, rawError?: any) {
    super(message);
    this.name = 'MetallicError';
    this.statusCode = statusCode;
    this.rawError = rawError;
  }
}

export function transformAxiosError(error: unknown): MetallicError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || `Request failed with status ${status}`;
      return new MetallicError(message, status, error);
    } else if (error.request) {
      return new MetallicError('No response from server. Check your connection.', undefined, error);
    } else {
      return new MetallicError(`Request setup error: ${error.message}`, undefined, error);
    }
  }

  return new MetallicError('An unknown error occurred.', undefined, error);
}
