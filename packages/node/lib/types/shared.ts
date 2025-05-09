export interface PaginationParameters {
  limit?: number;
  order?: 'asc' | 'desc';
  after?: string;
  before?: string;
}
