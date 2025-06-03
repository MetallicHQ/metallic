export class MetallicError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'MetallicError';
  }
}

export class TimeoutError extends MetallicError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends MetallicError {
  constructor(message: any) {
    super(message);
    this.name = 'RateLimitError';
  }
}
