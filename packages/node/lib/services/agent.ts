import * as grpc from '@grpc/grpc-js';
import {
  AgentClient,
  HealthCheckRequest,
  HealthCheckResponse,
  MetricsRequest,
  MetricsResponse
} from '../generated/agent';
import { METALLIC_AGENT_PORT } from '../utils/constants';

export class AgentService {
  private client: AgentClient;

  constructor(templateSlug: string, instanceId: string) {
    this.client = new AgentClient(
      `${templateSlug}-${instanceId}-${METALLIC_AGENT_PORT}.metallic.computer:443`,
      grpc.credentials.createSsl()
    );
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return new Promise((resolve, reject) => {
      const request: HealthCheckRequest = {};
      this.client.healthCheck(request, (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(response);
      });
    });
  }

  async getMetrics(): Promise<MetricsResponse> {
    return new Promise((resolve, reject) => {
      const request: MetricsRequest = {};
      this.client.metrics(request, (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(response);
      });
    });
  }
}
