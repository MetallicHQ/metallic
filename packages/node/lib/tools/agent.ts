import { AgentService } from '../services/agent';
import { Metrics } from '../types/agent';

export class Agent {
  private readonly agentService: AgentService;

  constructor(template: string, token: string) {
    this.agentService = new AgentService(template, token);
  }

  async healthCheck(): Promise<boolean> {
    const response = await this.agentService.healthCheck();
    return response.success;
  }

  async getMetrics(): Promise<Metrics> {
    const response = await this.agentService.getMetrics();
    return {
      cpu_count: response.cpuCount,
      cpu_used_pct: response.cpuUsedPct,
      mem_total_mib: response.memTotalMiB,
      mem_used_mib: response.memUsedMiB,
      gpu: response.gpu,
      vram_total_mib: response.vramTotalMiB,
      vram_used_mib: response.vramUsedMiB,
      timestamp: response.timestamp
    };
  }

  async getHost(port: number): Promise<string> {
    const response = await this.agentService.getHost(port);
    return response.host;
  }
}
