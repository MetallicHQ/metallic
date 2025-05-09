import { AxiosInstance } from 'axios';
import { ITemplate, ListTemplatesResponse, TemplateDestroyedResponse, UpdateTemplateOptions } from '../types/template';

export class TemplateClient {
  constructor(private readonly api: AxiosInstance) {}

  public async list(): Promise<ListTemplatesResponse> {
    const response = await this.api.get<ListTemplatesResponse>('/templates');
    return response.data;
  }

  public async get(slug: string): Promise<ITemplate> {
    const response = await this.api.get<ITemplate>(`/templates/${slug}`);
    return response.data;
  }

  public async update(slug: string, options: UpdateTemplateOptions): Promise<ITemplate> {
    const response = await this.api.put<ITemplate>(`/templates/${slug}`, options);
    return response.data;
  }

  public async destroy(slug: string): Promise<TemplateDestroyedResponse> {
    const response = await this.api.delete<TemplateDestroyedResponse>(`/templates/${slug}`);
    return response.data;
  }
}
