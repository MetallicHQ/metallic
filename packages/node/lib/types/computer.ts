import { PaginationParameters } from './shared';
import { ITemplate } from './template';

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
  template: ITemplate;
  instance_id: string;
  instance_type: InstanceType;
  state: ComputerState;
  region: Region;
  inactivity_timeout_ms: number | null;
  auto_destroy: boolean;
  metadata: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateComputerOptions {
  template?: string;
  region?: Region;
  instance_type?: InstanceType;
  inactivity_timeout_ms?: number | null;
  metadata?: Record<string, string>;
  skip_launch?: boolean;
}

export interface ListComputersOptions extends PaginationParameters {
  region?: Region;
  instance_type?: InstanceType;
  state?: ComputerState;
  template?: string;
}

export interface ListComputersResponse {
  object: 'list';
  data: IComputer[];
  first: string | null;
  last: string | null;
  has_more: boolean;
}

export interface UpdateComputerOptions {
  auto_destroy?: boolean;
  inactivity_timeout_ms?: number | null;
  metadata?: Record<string, string>;
}

export interface ComputerDestroyedResponse {
  object: 'computer';
  id: string;
  destroyed: true;
}

export type Region =
  | 'ams' // Amsterdam, Netherlands
  | 'arn' // Stockholm, Sweden
  | 'atl' // Atlanta, Georgia (US)
  | 'bog' // Bogotá, Colombia
  | 'bom' // Mumbai, India
  | 'bos' // Boston, Massachusetts (US)
  | 'cdg' // Paris, France
  | 'den' // Denver, Colorado (US)
  | 'dfw' // Dallas, Texas (US)
  | 'ewr' // Secaucus, NJ (US)
  | 'eze' // Ezeiza, Argentina
  | 'fra' // Frankfurt, Germany
  | 'gdl' // Guadalajara, Mexico
  | 'gig' // Rio de Janeiro, Brazil
  | 'gru' // São Paulo, Brazil
  | 'hkg' // Hong Kong
  | 'iad' // Ashburn, Virginia (US)
  | 'jnb' // Johannesburg, South Africa
  | 'lax' // Los Angeles, California (US)
  | 'lhr' // London, United Kingdom
  | 'mad' // Madrid, Spain
  | 'mia' // Miami, Florida (US)
  | 'nrt' // Tokyo, Japan
  | 'ord' // Chicago, Illinois (US)
  | 'otp' // Bucharest, Romania
  | 'phx' // Phoenix, Arizona (US)
  | 'qro' // Querétaro, Mexico
  | 'scl' // Santiago, Chile
  | 'sea' // Seattle, Washington (US)
  | 'sin' // Singapore
  | 'sjc' // San Jose, California (US)
  | 'syd' // Sydney, Australia
  | 'waw' // Warsaw, Poland
  | 'yul' // Montreal, Canada
  | 'yyz'; // Toronto, Canada

export type InstanceType =
  | '1x2' // 1 CPU, 2GB RAM
  | '2x4' // 2 CPUs, 4GB RAM
  | '4x8' // 4 CPUs, 8GB RAM
  | '8x16' // 8 CPUs, 16GB RAM
  | '16x32' // 16 CPUs, 32GB RAM
  | 'a10' // 8 CPUs, 32GB RAM, A10 GPU
  | 'a100-40gb' // 8 CPUs, 32GB RAM, A100 GPU
  | 'a100-80gb' // 8 CPUs, 32GB RAM, A100 GPU
  | 'l40s'; // 8 CPUs, 32GB RAM, L40S GPU
