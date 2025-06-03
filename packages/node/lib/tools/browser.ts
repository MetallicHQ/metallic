import { BrowserService } from '../services/browser';
import { BrowserLaunchOptions } from '../types/browser';

export class BrowserTool {
  private readonly browserService: BrowserService;

  constructor(
    private readonly template: string,
    private readonly instanceId: string
  ) {
    this.browserService = new BrowserService(template, instanceId);
  }

  private getCdpUrl(cdpPort: number): string {
    return `https://${this.template}-${this.instanceId}-${cdpPort}.metallic.computer`;
  }

  /**
   * Launch a new browser session
   * @returns A handle to the browser session
   */
  public async launch(options?: BrowserLaunchOptions): Promise<BrowserSessionHandle> {
    const { blockAds, context, proxyUrl, customHeaders, timeout, timezone, userAgent, dimensions } = options || {};

    const response = await this.browserService.createSession({
      blockAds,
      context: context ? JSON.stringify(context) : undefined,
      proxyUrl,
      customHeaders: customHeaders || {},
      timeout,
      timezone,
      userAgent,
      dimensions
    });

    const cdpUrl = this.getCdpUrl(response.cdpPort);
    return new BrowserSessionHandle(cdpUrl, this.browserService);
  }

  /**
   * Close the browser session
   */
  public async close(): Promise<void> {
    await this.browserService.terminateSession({});
  }
}

export class BrowserSessionHandle {
  /**
   * The Chrome DevTools Protocol (CDP) URL of the browser session
   */
  public readonly cdpUrl: string;
  private readonly browserService: BrowserService;

  constructor(cdpUrl: string, browserService: BrowserService) {
    this.cdpUrl = cdpUrl;
    this.browserService = browserService;
  }

  /**
   * Close the browser session
   */
  public async close(): Promise<void> {
    await this.browserService.terminateSession({});
  }
}
