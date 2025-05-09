export interface Metrics {
  /**
   * The number of CPU cores.
   */
  cpu_count: number;
  /**
   * The percentage of CPU used.
   */
  cpu_used_pct: number;
  /**
   * The total memory in MB.
   */
  mem_total_mib: number;
  /**
   * The used memory in MB.
   */
  mem_used_mib: number;
  /**
   * The name of the GPU.
   */
  gpu: string | undefined;
  /**
   * The total VRAM in MB.
   */
  vram_total_mib: number | undefined;
  /**
   * The used VRAM in MB.
   */
  vram_used_mib: number | undefined;
  /**
   * The timestamp of the metrics.
   */
  timestamp: string;
}
