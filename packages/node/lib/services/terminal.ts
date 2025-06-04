import * as grpc from '@grpc/grpc-js';
import {
  ConnectToProcessRequest,
  ListProcessesRequest,
  ListProcessesResponse,
  ProcessEvent,
  SendInputRequest,
  SendInputResponse,
  SendSignalRequest,
  SendSignalResponse,
  SpawnProcessRequest,
  TerminalClient,
  UpdateProcessRequest,
  UpdateProcessResponse
} from '../generated/terminal';
import { METALLIC_AGENT_PORT } from '../utils/constants';

export class TerminalService {
  private client: TerminalClient;

  constructor(projectId: string, instanceId: string) {
    this.client = new TerminalClient(
      `${projectId}-${instanceId}-${METALLIC_AGENT_PORT}.metallic.computer:443`,
      grpc.credentials.createSsl()
    );
  }

  async listProcesses(req: ListProcessesRequest): Promise<ListProcessesResponse> {
    return new Promise((resolve, reject) => {
      this.client.listProcesses(req, (err, response) => {
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

  spawnProcess(req: SpawnProcessRequest): grpc.ClientReadableStream<ProcessEvent> {
    return this.client.spawnProcess(req);
  }

  connectToProcess(req: ConnectToProcessRequest): grpc.ClientReadableStream<ProcessEvent> {
    return this.client.connectToProcess(req);
  }

  async sendInput(req: SendInputRequest): Promise<SendInputResponse> {
    return new Promise((resolve, reject) => {
      this.client.sendInput(req, (err, response) => {
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

  async updateProcess(req: UpdateProcessRequest): Promise<UpdateProcessResponse> {
    return new Promise((resolve, reject) => {
      this.client.updateProcess(req, (err, response) => {
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

  async sendSignal(req: SendSignalRequest): Promise<SendSignalResponse> {
    return new Promise((resolve, reject) => {
      this.client.sendSignal(req, (err, response) => {
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
