
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
