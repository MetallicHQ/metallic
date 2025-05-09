import { AxiosInstance } from 'axios';
import { Browser } from '../tools/browser';
import { IComputer } from '../types/computer';
import { Computer } from './computer';

export class ComputerWithBrowser extends Computer {
  public readonly browser: Browser;

  constructor(api: AxiosInstance, data: IComputer) {
    super(api, data);
    this.browser = new Browser(this.template.slug, this.instanceId);
  }
}
