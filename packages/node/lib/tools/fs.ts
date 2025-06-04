import { ClientWritableStream } from '@grpc/grpc-js';
import { Readable, Writable } from 'stream';
import { FileChunk } from '../generated/filesystem';
import { FilesystemService } from '../services/fs';
import { WatchEvent, WatchEventType, WatchHandle, WatchOptions } from '../types/fs';

export class FilesystemTool {
  private readonly fs: FilesystemService;

  constructor(projectId: string, instanceId: string) {
    this.fs = new FilesystemService(projectId, instanceId);
  }

  /**
   * Read a file as text
   * @param path Path to the file
   * @returns File content as string
   */
  async readFile(path: string, format: 'text'): Promise<string>;

  /**
   * Read a file as binary buffer
   * @param path Path to the file
   * @returns File content as Buffer
   */
  async readFile(path: string, format: 'bytes'): Promise<Buffer>;

  /**
   * Read a file as blob
   * @param path Path to the file
   * @returns File content as Blob
   */
  async readFile(path: string, format: 'blob'): Promise<Blob>;

  /**
   * Read a file with default format (text)
   * @param path Path to the file
   * @returns File content as string
   */
  async readFile(path: string): Promise<string>;

  /**
   * Read a file as bytes or blob
   * @param path Path to the file
   * @param format Format to read the file as
   * @returns File content as Buffer or Blob
   */
  async readFile(path: string, format: 'bytes' | 'blob'): Promise<Buffer | Blob>;

  // Implementation for all overloads
  async readFile(path: string, format: 'text' | 'bytes' | 'blob' = 'text'): Promise<string | Buffer | Blob> {
    const response = await this.fs.readFile({ path, format });
    if (!response.success) {
      throw new Error(response.error);
    }

    if (format === 'text') {
      return response.content;
    } else if (format === 'bytes') {
      return response.binary;
    } else if (format === 'blob') {
      return new Blob([response.binary]);
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  /**
   * Create a readable stream from a file
   * @param path Path to the file
   * @returns Node.js Readable stream
   */
  readFileStream(path: string): Readable {
    const grpcStream = this.fs.readFileStream({ path });
    const nodeStream = new Readable({
      objectMode: true,
      read() {} // Implementation required but noop is fine
    });

    grpcStream.on('data', (chunk: FileChunk) => {
      if (chunk.error) {
        nodeStream.emit('error', new Error(chunk.error));
        return;
      }

      if (chunk.content.length > 0) {
        nodeStream.push(chunk.content);
      }

      if (chunk.end) {
        nodeStream.push(null); // End of stream
      }
    });

    grpcStream.on('error', (err) => {
      nodeStream.emit('error', err);
    });

    grpcStream.on('end', () => {
      nodeStream.push(null);
    });

    return nodeStream;
  }

  /**
   * Write text to a file
   * @param path Path to the file
   * @param content Content to write as string
   */
  async writeFile(path: string, content: string): Promise<void>;

  /**
   * Write binary data to a file
   * @param path Path to the file
   * @param content Content to write as Buffer
   */
  async writeFile(path: string, content: Buffer): Promise<void>;

  /**
   * Write blob to a file
   * @param path Path to the file
   * @param content Content to write as Blob
   */
  async writeFile(path: string, content: Blob): Promise<void>;

  // Implementation for all overloads
  async writeFile(path: string, content: string | Buffer | Blob): Promise<void> {
    let format: 'text' | 'bytes' | 'blob';
    let binaryContent: Buffer | null = null;
    let textContent: string = '';

    if (typeof content === 'string') {
      format = 'text';
      textContent = content;
    } else if (Buffer.isBuffer(content)) {
      format = 'bytes';
      binaryContent = content;
    } else if (content instanceof Blob) {
      format = 'blob';
      // Convert Blob to Buffer
      const arrayBuffer = await content.arrayBuffer();
      binaryContent = Buffer.from(arrayBuffer);
    } else {
      throw new Error('Unsupported content type');
    }

    await this.fs.writeFile({
      path,
      format,
      content: textContent,
      binary: binaryContent || Buffer.from([])
    });
  }

  /**
   * Create a writable stream to a file
   * @param path Path to the file
   * @returns Node.js Writable stream
   */
  createWriteStream(path: string): Writable {
    let grpcStream: ClientWritableStream<FileChunk> | null = null;

    const nodeStream = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        if (!grpcStream) {
          callback(new Error('Stream not initialized'));
          return;
        }

        const fileChunk: FileChunk = {
          path,
          content: Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
          end: false,
          error: ''
        };

        const success = grpcStream.write(fileChunk);
        if (success) {
          callback();
        } else {
          grpcStream.once('drain', callback);
        }
      },
      final(callback) {
        if (!grpcStream) {
          callback(new Error('Stream not initialized'));
          return;
        }

        const endChunk: FileChunk = {
          path,
          content: Buffer.alloc(0),
          end: true,
          error: ''
        };

        grpcStream.write(endChunk);
        grpcStream.end();
        callback();
      }
    });

    grpcStream = this.fs.writeFileStream((error, response) => {
      if (error) {
        nodeStream.emit('error', error);
      } else if (!response.success) {
        nodeStream.emit('error', new Error(response.error));
      } else {
        nodeStream.emit('finish');
      }
    });

    return nodeStream;
  }

  /**
   * List files and directories in a directory
   * @param path Path to the directory
   * @returns Contents of the directory
   */
  async listDirectory(path: string): Promise<string[]> {
    const response = await this.fs.readDirectory({ path });
    return response.files;
  }

  /**
   * Create a directory
   * @param path Path to create
   */
  async createDirectory(path: string): Promise<void> {
    await this.fs.createDirectory({ path });
  }

  /**
   * Rename a file or directory
   * @param oldPath Current path
   * @param newPath New path
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    await this.fs.rename({ oldPath, newPath });
  }

  /**
   * Delete a file or directory
   * @param path Path to delete
   */
  async delete(path: string): Promise<void> {
    await this.fs.unlink({ path });
  }

  /**
   * Check if a file or directory exists
   * @param path Path to check
   * @returns Whether the path exists
   */
  async exists(path: string): Promise<boolean> {
    const response = await this.fs.exists({ path });
    return response.exists;
  }

  /**
   * Get file or directory stats
   * @param path Path to get stats for
   * @returns Stats object
   */
  async getStats(path: string): Promise<{
    isDirectory: boolean;
    isFile: boolean;
    size: number;
    modifiedTime: string;
  }> {
    const response = await this.fs.getStats({ path });
    return {
      isDirectory: response.isDirectory,
      isFile: response.isFile,
      size: response.size,
      modifiedTime: response.modifiedTime
    };
  }

  /**
   * Start watching a directory for filesystem events
   * @param path Directory to watch
   * @param onEvent Callback to call when an event in the directory occurs
   * @param options Watch options
   * @returns Handle to stop watching directory
   */
  watch(path: string, onEvent: (event: WatchEvent) => void, options?: WatchOptions): WatchHandle {
    const opts: Required<WatchOptions> = {
      recursive: options?.recursive ?? false,
      events: options?.events ?? ['CREATED', 'MODIFIED', 'DELETED'],
      timeoutMs: options?.timeoutMs ?? 0,
      onClose: options?.onClose ?? (() => {}),
      onError: options?.onError ?? ((err) => console.error('Watch error:', err))
    };

    const eventFlags = this.convertEventTypesToFlags(opts.events);
    const grpcStream = this.fs.watch({
      path,
      recursive: opts.recursive,
      events: eventFlags
    });

    let timeoutId: NodeJS.Timeout | null = null;
    if (opts.timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        grpcStream.cancel();
        opts.onClose();
      }, opts.timeoutMs);
    }

    grpcStream.on('data', (data) => {
      if (data.error) {
        opts.onError(new Error(data.error));
        return;
      }

      const eventType = data.type;
      if (opts.events.includes(eventType)) {
        onEvent({
          path: data.path,
          type: eventType,
          oldPath: data.oldPath,
          isDirectory: data.isDirectory
        });
      }
    });

    grpcStream.on('error', (err) => {
      opts.onError(err);
    });

    grpcStream.on('end', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      opts.onClose();
    });

    return {
      stop: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        grpcStream.cancel();
        opts.onClose();
      }
    };
  }

  private convertEventTypesToFlags(events: WatchEventType[]): number {
    let flags = 0;

    if (events.includes('CREATED')) {
      flags |= 0x1;
    }

    if (events.includes('MODIFIED')) {
      flags |= 0x2;
    }

    if (events.includes('DELETED')) {
      flags |= 0x4;
    }

    if (flags === 0) {
      flags = 0xffffffff;
    }

    return flags;
  }
}
