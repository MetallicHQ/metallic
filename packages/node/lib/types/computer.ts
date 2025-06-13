import { ApiClientOptions } from './api';
import { Region } from './shared';

export type ComputerConstructorOptions = ApiClientOptions & Omit<IComputer, 'object' | 'created_at' | 'updated_at'>;

export interface ComputerCreateOptions extends ApiClientOptions {
  /**
   * The template slug to create the computer from.
   *
   * @defaultValue `base`
   */
  template?: string;
  /**
   * The region to create the computer in.
   *
   * @defaultValue `us-west-2`
   */
  region?: Region;
  /**
   * The time to live for the computer in seconds. The computer will be automatically stopped after this amount of time.
   *
   * @defaultValue `300` (5 minutes)
   */
  ttlSeconds?: number | null;
  /**
   * Whether to automatically destroy the computer after it stops.
   *
   * @defaultValue `false`
   */
  autoDestroy?: boolean;
  /**
   * The environment variables to set for the computer.
   */
  env?: Record<string, string>;
  /**
   * The metadata to set for the computer.
   */
  metadata?: Record<string, string>;
}

export interface ComputerConnectOptions extends ApiClientOptions {}

export interface ComputerStartOptions extends ApiClientOptions {}

export interface ComputerForkOptions extends ApiClientOptions {}

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
  /**
   * The unique identifier for the computer.
   */
  id: string;
  /**
   * The unique identifier for the project.
   */
  project_id: string;
  /**
   * The template slug the computer was created from.
   */
  template: string;
  /**
   * An identifier for the computer's instance (internal use only).
   */
  instance_id: string;
  /**
   * The current state of the computer.
   */
  state: ComputerState;
  /**
   * The region the computer is in. One of `us-west-2`, `us-east-1`, `eu-central-1`, or `ap-southeast-1`.
   */
  region: Region;
  /**
   * The time to live for the computer in seconds.
   */
  ttl_seconds: number | null;
  /**
   * Whether the computer will be automatically destroyed when it is stopped.
   */
  auto_destroy: boolean;
  /**
   * Metadata for the computer.
   */
  metadata: Record<string, string> | null;
  /**
   * The date and time the computer was created.
   */
  created_at: string;
  /**
   * The date and time the computer was last updated.
   */
  updated_at: string;
}
