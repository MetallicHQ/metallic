export interface ITemplate {
  slug: string;
  image: string;
  name: string | null;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListTemplatesResponse {
  object: 'list';
  data: ITemplate[];
}

export interface UpdateTemplateOptions {
  name?: string | null;
  description?: string | null;
  is_public?: boolean;
}

export interface TemplateDestroyedResponse {
  object: 'template';
  slug: string;
  destroyed: true;
}
