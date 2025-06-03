import * as grpc from '@grpc/grpc-js';
import {
  BrowserClient,
  CreateSessionRequest,
  CreateSessionResponse,
  TerminateSessionRequest,
  TerminateSessionResponse
} from '../generated/browser';
import { METALLIC_AGENT_PORT } from '../utils/constants';

export class BrowserService {
  private client: BrowserClient;

  constructor(template: string, instanceId: string) {
    this.client = new BrowserClient(
      `${template}-${instanceId}-${METALLIC_AGENT_PORT}.metallic.computer:443`,
      grpc.credentials.createSsl()
    );
  }

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    return new Promise((resolve, reject) => {
      this.client.createSession(request, (err, response) => {
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

  async terminateSession(request: TerminateSessionRequest): Promise<TerminateSessionResponse> {
    return new Promise((resolve, reject) => {
      this.client.terminateSession(request, (err, response) => {
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
