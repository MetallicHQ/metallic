import { ApiClientOptions } from './api';
import { Instance, Region } from './shared';

export type ComputerConstructorOptions = ApiClientOptions & Omit<IComputer, 'object' | 'created_at' | 'updated_at'>;

export interface ComputerCreateOptions extends ApiClientOptions {
  template?: string;
  region?: Region;
  instance?: Instance;
  inactivityTimeoutMs?: number | null;
  metadata?: Record<string, string>;
  skipLaunch?: boolean;
}

export interface ComputerConnectOptions extends ApiClientOptions {}

export interface ComputerStartOptions extends ApiClientOptions {}

export type ComputerState =
  | 'created'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped'
  | 'replacing'
  | 'destroying'
  | 'destroyed';

export interface IComputer {
  object: 'computer';
  id: string;
  template: string;
  virtual_machine_id: string;
  instance: Instance;
  state: ComputerState;
  region: Region;
  inactivity_timeout_ms: number | null;
  auto_destroy: boolean;
  metadata: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
  /**
   * The number of CPU cores.
   */
  cpuCount: number;
  /**
   * The percentage of CPU used.
   */
  cpuUsedPct: number;
  /**
   * The total memory in MB.
   */
  memTotalMiB: number;
  /**
   * The used memory in MB.
   */
  memUsedMiB: number;
  /**
   * The name of the GPU.
   */
  gpu: string | undefined;
  /**
   * The total VRAM in MB.
   */
  vramTotalMiB: number | undefined;
  /**
   * The used VRAM in MB.
   */
  vramUsedMiB: number | undefined;
  /**
   * The timestamp of the metrics.
   */
  timestamp: string;
}
