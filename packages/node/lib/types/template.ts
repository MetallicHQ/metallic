export type BaseTemplate = 'base' | 'slim';

export interface ITemplate {
  slug: string;
  image: string;
  base_template: BaseTemplate;
  name: string | null;
  description: string | null;
  cmd: string[];
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
