import * as grpc from '@grpc/grpc-js';
import {
  CreateDirectoryRequest,
  CreateDirectoryResponse,
  ExistsRequest,
  ExistsResponse,
  FileChunk,
  FilesystemClient,
  GetStatsRequest,
  GetStatsResponse,
  ReadDirectoryRequest,
  ReadDirectoryResponse,
  ReadFileRequest,
  ReadFileResponse,
  ReadFileStreamRequest,
  RenameRequest,
  RenameResponse,
  UnlinkRequest,
  UnlinkResponse,
  WatchEvent,
  WatchRequest,
  WriteFileRequest,
  WriteFileResponse
} from '../generated/filesystem';
import { createAgentUrl } from '../utils/helpers';

export class FilesystemService {
  private client: FilesystemClient;

  constructor(projectId: string, instanceId: string) {
    this.client = new FilesystemClient(createAgentUrl(projectId, instanceId), grpc.credentials.createSsl());
  }

  async readFile(req: ReadFileRequest): Promise<ReadFileResponse> {
    return new Promise((resolve, reject) => {
      this.client.readFile(req, (err, response) => {
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

  readFileStream(req: ReadFileStreamRequest): grpc.ClientReadableStream<FileChunk> {
    return this.client.readFileStream(req);
  }

  async writeFile(req: WriteFileRequest): Promise<WriteFileResponse> {
    return new Promise((resolve, reject) => {
      this.client.writeFile(req, (err, response) => {
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

  writeFileStream(
    callback: (error: grpc.ServiceError | null, response: WriteFileResponse) => void
  ): grpc.ClientWritableStream<FileChunk> {
    return this.client.writeFileStream(callback);
  }

  async readDirectory(req: ReadDirectoryRequest): Promise<ReadDirectoryResponse> {
    return new Promise((resolve, reject) => {
      this.client.readDirectory(req, (err, response) => {
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

  async createDirectory(req: CreateDirectoryRequest): Promise<CreateDirectoryResponse> {
    return new Promise((resolve, reject) => {
      this.client.createDirectory(req, (err, response) => {
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

  async rename(req: RenameRequest): Promise<RenameResponse> {
    return new Promise((resolve, reject) => {
      this.client.rename(req, (err, response) => {
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

  async unlink(req: UnlinkRequest): Promise<UnlinkResponse> {
    return new Promise((resolve, reject) => {
      this.client.unlink(req, (err, response) => {
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

  async exists(req: ExistsRequest): Promise<ExistsResponse> {
    return new Promise((resolve, reject) => {
      this.client.exists(req, (err, response) => {
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

  async getStats(req: GetStatsRequest): Promise<GetStatsResponse> {
    return new Promise((resolve, reject) => {
      this.client.getStats(req, (err, response) => {
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

  watch(req: WatchRequest): grpc.ClientReadableStream<WatchEvent> {
    return this.client.watch(req);
  }
}
