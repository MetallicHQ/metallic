import { AxiosInstance } from 'axios';
import { CodeInterpreter } from '../tools/code-interpreter';
import { IComputer } from '../types/computer';
import { Computer } from './computer';

export class ComputerWithCodeInterpreter extends Computer {
  public readonly code: CodeInterpreter;

  constructor(api: AxiosInstance, data: IComputer) {
    super(api, data);
    this.code = new CodeInterpreter(this.template.slug, this.instanceId);
  }
}
