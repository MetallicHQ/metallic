import { ExecutionError } from '../utils/error';
import { OutputMessage, Result } from '../utils/jupyter';

/**
 * Chart types
 */
export enum ChartType {
  LINE = 'line',
  SCATTER = 'scatter',
  BAR = 'bar',
  PIE = 'pie',
  BOX_AND_WHISKER = 'box_and_whisker',
  SUPERCHART = 'superchart',
  UNKNOWN = 'unknown'
}

/**
 * Ax scale types
 */
export enum ScaleType {
  LINEAR = 'linear',
  DATETIME = 'datetime',
  CATEGORICAL = 'categorical',
  LOG = 'log',
  SYMLOG = 'symlog',
  LOGIT = 'logit',
  FUNCTION = 'function',
  FUNCTIONLOG = 'functionlog',
  ASINH = 'asinh'
}

/**
 * Represents a chart.
 */
export type Chart = {
  type: ChartType;
  title: string;
  elements: any[];
};

type Chart2D = Chart & {
  x_label?: string;
  y_label?: string;
  x_unit?: string;
  y_unit?: string;
};

export type PointData = {
  label: string;
  points: [number | string, number | string][];
};

type PointChart = Chart2D & {
  x_ticks: (number | string)[];
  x_scale: ScaleType;
  x_tick_labels: string[];
  y_ticks: (number | string)[];
  y_scale: ScaleType;
  y_tick_labels: string[];
  elements: PointData[];
};

export type LineChart = PointChart & {
  type: ChartType.LINE;
};

export type ScatterChart = PointChart & {
  type: ChartType.SCATTER;
};

export type BarData = {
  label: string;
  value: string;
  group: string;
};

export type BarChart = Chart2D & {
  type: ChartType.BAR;
  elements: BarData[];
};

export type PieData = {
  label: string;
  angle: number;
  radius: number;
};

export type PieChart = Chart & {
  type: ChartType.PIE;
  elements: PieData[];
};

export type BoxAndWhiskerData = {
  label: string;
  min: number;
  first_quartile: number;
  median: number;
  third_quartile: number;
  max: number;
  outliers: number[];
};

export type BoxAndWhiskerChart = Chart2D & {
  type: ChartType.BOX_AND_WHISKER;
  elements: BoxAndWhiskerData[];
};

export type SuperChart = Chart & {
  type: ChartType.SUPERCHART;
  elements: Chart[];
};

export type ChartTypes = LineChart | ScatterChart | BarChart | PieChart | BoxAndWhiskerChart | SuperChart;

/**
 * Represents a context for code execution.
 */
export type ExecutionContext = {
  /**
   * The ID of the context.
   */
  id: string;
  /**
   * The language of the context.
   */
  language: string;
  /**
   * The working directory of the context.
   */
  cwd: string;
};

/**
 * Options for running code.
 */
export interface RunCodeOptions {
  /**
   * Callback for handling stdout messages.
   */
  onStdout?: (output: OutputMessage) => Promise<any> | any;
  /**
   * Callback for handling stderr messages.
   */
  onStderr?: (output: OutputMessage) => Promise<any> | any;
  /**
   * Callback for handling the final execution result.
   */
  onResult?: (data: Result) => Promise<any> | any;
  /**
   * Callback for handling the `ExecutionError` object.
   */
  onError?: (error: ExecutionError) => Promise<any> | any;
  /**
   * Custom environment variables for code execution.
   *
   * @default {}
   */
  env?: Record<string, string>;
  /**
   * Timeout for the code execution in **milliseconds**.
   *
   * @default 60_000 // 60 seconds
   */
  timeoutMs?: number;
  /**
   * Timeout for the request in **milliseconds**.
   *
   * @default 30_000 // 30 seconds
   */
  requestTimeoutMs?: number;
}

/**
 * Represents a MIME type.
 */
export type MIMEType = string;

type MetallicData = {
  data: Record<string, unknown>;
  chart: ChartTypes;
};

/**
 * Dictionary that maps MIME types to their corresponding representations of the data.
 */
export type RawData = {
  [key: MIMEType]: string;
} & MetallicData;

/**
 * Data printed to stdout and stderr during execution, usually by print statements, logs, warnings, subprocesses, etc.
 */
export type Logs = {
  /**
   * List of strings printed to stdout by prints, subprocesses, etc.
   */
  stdout: string[];
  /**
   * List of strings printed to stderr by prints, subprocesses, etc.
   */
  stderr: string[];
};

/**
 * Options for creating a code context.
 */
export interface CreateCodeContextOptions {
  /**
   * Working directory for the context.
   *
   * @default /home/user
   */
  cwd?: string;
  /**
   * Language for the context.
   *
   * @default python
   */
  language?: string;
  /**
   * Timeout for the request in **milliseconds**.
   *
   * @default 30_000 // 30 seconds
   */
  requestTimeoutMs?: number;
}
