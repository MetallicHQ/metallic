export type WatchEventType = 'CREATED' | 'MODIFIED' | 'DELETED';

export type WatchEvent = {
  path: string;
  type: WatchEventType;
  oldPath: string;
  isDirectory: boolean;
};

export interface WatchOptions {
  recursive?: boolean;
  events?: WatchEventType[];
  timeoutMs?: number;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export interface WatchHandle {
  stop: () => void;
}
