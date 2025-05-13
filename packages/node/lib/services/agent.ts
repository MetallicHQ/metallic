import * as grpc from '@grpc/grpc-js';
import {
  AgentClient,
  GetHostRequest,
  GetHostResponse,
  HealthCheckRequest,
  HealthCheckResponse,
  MetricsRequest,
  MetricsResponse
} from '../generated/agent';
import { METALLIC_AGENT_PORT } from '../utils/constants';

export class AgentService {
  private client: AgentClient;

  constructor(
    private template: string,
    private virtualMachineId: string
  ) {
    this.client = new AgentClient(
      `${template}-${virtualMachineId}-${METALLIC_AGENT_PORT}.metallic.computer:443`,
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

        if (!response.success) {
          reject(new Error(response.error));
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

        if (!response.success) {
          reject(new Error(response.error));
          return;
        }

        resolve(response);
      });
    });
  }

  async getHost(port: number): Promise<GetHostResponse> {
    return new Promise((resolve, reject) => {
      const request: GetHostRequest = {
        template: this.template,
        virtualMachineId: this.virtualMachineId,
        port
      };

      this.client.getHost(request, (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        if (!response.success) {
          reject(new Error(response.error));
          return;
        }

        resolve(response);
      });
    });
  }
}
