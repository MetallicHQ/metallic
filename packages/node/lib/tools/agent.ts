import { AgentService } from '../services/agent';
import { Metrics } from '../types/agent';

export class AgentTool {
  private readonly agentService: AgentService;

  constructor(template: string, instanceId: string) {
    this.agentService = new AgentService(template, instanceId);
  }

  async healthCheck(): Promise<boolean> {
    const response = await this.agentService.healthCheck();
    return response.success;
  }

  async getMetrics(): Promise<Metrics> {
    const response = await this.agentService.getMetrics();
    return {
      cpuCount: response.cpuCount,
      cpuUsedPct: response.cpuUsedPct,
      memTotalMiB: response.memTotalMiB,
      memUsedMiB: response.memUsedMiB,
      gpu: response.gpu,
      vramTotalMiB: response.vramTotalMiB,
      vramUsedMiB: response.vramUsedMiB,
      timestamp: response.timestamp
    };
  }

  async getHost(port: number): Promise<string> {
    const response = await this.agentService.getHost(port);
    return response.host;
  }
}
