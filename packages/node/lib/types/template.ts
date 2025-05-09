import { Computer } from '../computer/computer';
import { ComputerWithBrowser } from '../computer/computer-with-browser';
import { ComputerWithCodeInterpreter } from '../computer/computer-with-code-interpreter';

export type BaseTemplate = 'metallic-base' | 'metallic-browser' | 'metallic-code-interpreter';

export interface BaseTemplateMap {
  'metallic-base': Computer;
  'metallic-browser': ComputerWithBrowser;
  'metallic-code-interpreter': ComputerWithCodeInterpreter;
}

export interface ITemplate {
  slug: string;
  image: string;
  base_template_slug: BaseTemplate;
  name: string | null;
  description: string | null;
  cmd: string[];
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
