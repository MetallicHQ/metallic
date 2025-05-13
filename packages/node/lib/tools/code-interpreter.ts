import { CreateCodeContextOptions, ExecutionContext, RunCodeOptions } from '../types/code-interpreter';
import { DEFAULT_TIMEOUT_MS, METALLIC_JUPYTER_PORT } from '../utils/constants';
import { ExecutionError, MetallicError, TimeoutError } from '../utils/error';
import { Execution, OutputMessage, Result } from '../utils/jupyter';

export class CodeInterpreterTool {
  constructor(
    private readonly template: string,
    private readonly virtualMachineId: string
  ) {}

  protected get jupyterUrl(): string {
    return `https://${this.template}-${this.virtualMachineId}-${METALLIC_JUPYTER_PORT}.metallic.computer`;
  }

  /**
   * Run the code as Python.
   *
   * Specify the `language` or `context` option to run the code as a different language or in a different `Context`.
   *
   * You can reference previously defined variables, imports, and functions in the code.
   *
   * @param code code to execute.
   * @param options options for executing the code.
   *
   * @returns `Execution` result object.
   */
  async run(
    code: string,
    options?: RunCodeOptions & {
      /**
       * Language to use for code execution.
       *
       * If not defined, the default Python context is used.
       */
      language?: 'python';
    }
  ): Promise<Execution>;

  /**
   * Run the code for the specified language.
   *
   * Specify the `language` or `context` option to run the code as a different language or in a different `Context`.
   * If no language is specified, Python is used.
   *
   * You can reference previously defined variables, imports, and functions in the code.
   *
   * @param code code to execute.
   * @param options options for executing the code.
   *
   * @returns `Execution` result object.
   */
  async run(
    code: string,
    options?: RunCodeOptions & {
      /**
       * Language to use for code execution.
       *
       * If not defined, the default Python context is used.
       */
      language?: string;
    }
  ): Promise<Execution>;

  /**
   * Runs the code in the specified context, if not specified, the default context is used.
   *
   * Specify the `language` or `context` option to run the code as a different language or in a different `Context`.
   *
   * You can reference previously defined variables, imports, and functions in the code.
   *
   * @param code code to execute.
   * @param options options for executing the code
   *
   * @returns `Execution` result object
   */
  async run(
    code: string,
    options?: RunCodeOptions & {
      /**
       * Context to run the code in.
       */
      context?: ExecutionContext;
    }
  ): Promise<Execution>;

  // Implementation for
  async run(
    code: string,
    options?: RunCodeOptions & {
      language?: string;
      context?: ExecutionContext;
    }
  ): Promise<Execution> {
    if (options?.context && options?.language) {
      throw new MetallicError('You can provide context or language, but not both at the same time.');
    }

    const controller = new AbortController();
    const reqTimer = options?.requestTimeoutMs
      ? setTimeout(() => {
          controller.abort();
        }, options.requestTimeoutMs)
      : undefined;

    try {
      const res = await fetch(`${this.jupyterUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          context_id: options?.context?.id,
          language: options?.language,
          env_vars: options?.env
        }),
        signal: controller.signal,
        keepalive: true
      });

      if (!res.ok) {
        throw new MetallicError(`[${res.status}] ${res.statusText}`);
      }

      if (!res.body) {
        throw new MetallicError(`No response body: ${res.statusText}`);
      }

      if (reqTimer) {
        clearTimeout(reqTimer);
      }

      const bodyTimeout = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
      const bodyTimer = bodyTimeout
        ? setTimeout(() => {
            controller.abort();
          }, bodyTimeout)
        : undefined;

      const execution = new Execution();

      try {
        for await (const chunk of CodeInterpreterTool.readLines(res.body)) {
          await CodeInterpreterTool.parseOutput(
            execution,
            chunk,
            options?.onStdout,
            options?.onStderr,
            options?.onResult,
            options?.onError
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new TimeoutError("Execution timed out — the 'timeoutMs' option can be used to increase this timeout");
        }
        throw err;
      } finally {
        clearTimeout(bodyTimer);
      }

      return execution;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError(
          "Request timed out — the 'requestTimeoutMs' option can be used to increase this timeout"
        );
      }
      throw err;
    }
  }

  /**
   * Creates a new execution context to run code in.
   *
   * @param opts options for creating the context.
   *
   * @returns context object.
   */
  async createContext(options?: CreateCodeContextOptions): Promise<ExecutionContext> {
    try {
      const controller = new AbortController();
      const reqTimer = options?.requestTimeoutMs
        ? setTimeout(() => {
            controller.abort();
          }, options.requestTimeoutMs)
        : undefined;

      const res = await fetch(`${this.jupyterUrl}/contexts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: options?.language,
          cwd: options?.cwd
        }),
        keepalive: true,
        signal: controller.signal
      });

      if (!res.ok) {
        throw new MetallicError(`[${res.status}] ${res.statusText}`);
      }

      if (reqTimer) {
        clearTimeout(reqTimer);
      }

      return await res.json();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError(
          "Request timed out — the 'requestTimeoutMs' option can be used to increase this timeout"
        );
      }
      throw err;
    }
  }

  private static async *readLines(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (value !== undefined) {
          buffer += new TextDecoder().decode(value);
        }

        if (done) {
          if (buffer.length > 0) {
            yield buffer;
          }
          break;
        }

        let newlineIdx = -1;

        do {
          newlineIdx = buffer.indexOf('\n');
          if (newlineIdx !== -1) {
            yield buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
          }
        } while (newlineIdx !== -1);
      }
    } finally {
      reader.releaseLock();
    }
  }

  private static async parseOutput(
    execution: Execution,
    line: string,
    onStdout?: (output: OutputMessage) => Promise<any> | any,
    onStderr?: (output: OutputMessage) => Promise<any> | any,
    onResult?: (data: Result) => Promise<any> | any,
    onError?: (error: ExecutionError) => Promise<any> | any
  ) {
    const msg = JSON.parse(line);

    switch (msg.type) {
      case 'result':
        const result = new Result({ ...msg, type: undefined, is_main_result: undefined }, msg.is_main_result);
        execution.results.push(result);
        if (onResult) {
          await onResult(result);
        }
        break;
      case 'stdout':
        execution.logs.stdout.push(msg.text);
        if (onStdout) {
          await onStdout({
            error: false,
            line: msg.text,
            timestamp: new Date().getTime() * 1000
          });
        }
        break;
      case 'stderr':
        execution.logs.stderr.push(msg.text);
        if (onStderr) {
          await onStderr({
            error: true,
            line: msg.text,
            timestamp: new Date().getTime() * 1000
          });
        }
        break;
      case 'error':
        execution.error = new ExecutionError(msg.name, msg.value, msg.traceback);
        if (onError) {
          await onError(execution.error);
        }
        break;
      case 'number_of_executions':
        execution.executionCount = msg.execution_count;
        break;
    }
  }
}
