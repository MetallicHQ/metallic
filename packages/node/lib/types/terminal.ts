export interface RunCommandOptions {
  background?: boolean;
  cwd?: string;
  env?: Record<string, string>;
  onData?: (data: string) => void | Promise<void>;
  onExit?: (exitCode: number) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  cols?: number;
  rows?: number;
  timeoutMs?: number;
}

export type ConnectToProcessOptions = Omit<RunCommandOptions, 'background' | 'cwd' | 'env' | 'cols' | 'rows'>;

export interface CommandResult {
  data: string;
  exitCode: number;
}
