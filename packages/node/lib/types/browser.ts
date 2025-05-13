/**
 * CDP Network.Cookie schema
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Cookie
 */
export interface CDPCookie {
  /**
   * The name of the cookie.
   */
  name: string;
  /**
   * The value of the cookie.
   */
  value: string;
  /**
   * The URL of the cookie.
   */
  url?: string;
  /**
   * The domain of the cookie.
   */
  domain?: string;
  /**
   * The path of the cookie.
   */
  path?: string;
  /**
   * Whether the cookie is secure.
   */
  secure?: boolean;
  /**
   * Whether the cookie is HTTP only.
   */
  httpOnly?: boolean;
  /**
   * The same site attribute of the cookie.
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
  /**
   * The size of the cookie.
   */
  size?: number;
  /**
   * The expiration date of the cookie.
   */
  expires?: number;
  /**
   * The partition key of the cookie.
   */
  partitionKey?: string;
  /**
   * Whether the cookie is a session cookie.
   */
  session?: boolean;
  /**
   * The priority of the cookie.
   */
  priority?: 'Low' | 'Medium' | 'High';
  /**
   * Whether the cookie is a same party cookie.
   */
  sameParty?: boolean;
  /**
   * The source scheme of the cookie.
   */
  sourceScheme?:
    | 'Unset'
    | 'None'
    | 'Local'
    | 'SessionStorage'
    | 'LocalStorage'
    | 'ServiceWorker'
    | 'SharedWorker'
    | 'Unknown';
  /**
   * The source port of the cookie.
   */
  sourcePort?: number;
}

export interface SessionContext {
  /**
   * The cookies to set for the browser session.
   */
  cookies?: CDPCookie[];
  /**
   * The localStorage to set for the browser session.
   */
  localStorage?: Record<string, any>;
}

export interface Dimensions {
  /**
   * The width of the browser window.
   *
   * @defaultValue `1920`
   */
  width: number;
  /**
   * The height of the browser window.
   *
   * @defaultValue `1080`
   */
  height: number;
}

export interface BrowserLaunchOptions {
  /**
   * Whether to use the built-in ad blocker.
   *
   * @defaultValue `false`
   */
  blockAds?: boolean;
  /**
   * The context to use for the browser session.
   */
  context?: SessionContext;
  /**
   * The proxy URL to use for the browser session.
   */
  proxyUrl?: string;
  /**
   * The custom headers to use for the browser session.
   */
  customHeaders?: Record<string, string>;
  /**
   * The timeout to use for the browser session.
   *
   * @defaultValue `1000 * 60 * 10` (10 minutes)
   */
  timeout?: number;
  /**
   * The timezone to use for the browser session.
   *
   * @defaultValue `UTC`
   */
  timezone?: string;
  /**
   * The user agent to use for the browser session.
   */
  userAgent?: string;
  /**
   * The dimensions to use for the browser session.
   */
  dimensions?: Dimensions;
}

export type BrowserEvent =
  /**
   * Waits for the 'load' event.
   */
  | 'load'
  /**
   * Waits for the 'DOMContentLoaded' event.
   */
  | 'domcontentloaded'
  /**
   * Waits till there are no more than 0 network connections for at least `500`
   * ms.
   */
  | 'networkidle0'
  /**
   * Waits till there are no more than 2 network connections for at least `500`
   * ms.
   */
  | 'networkidle2';

export interface GoToOptions {
  /**
   * Maximum wait time in milliseconds. Pass 0 to disable the timeout.
   *
   * @defaultValue `30000`
   */
  timeout?: number;
  /**
   * When to consider waiting succeeds. Given an array of event strings, waiting
   * is considered to be successful after all events have been fired.
   *
   * @defaultValue `'load'`
   */
  waitUntil?: BrowserEvent;
  /**
   * If provided, it will take preference over the referer header value.
   */
  referer?: string;
  /**
   * If provided, it will take preference over the referer-policy header value.
   */
  referrerPolicy?: string;
}

export interface ScreenshotClip {
  /**
   * the x coordinate of the clip in pixels.
   */
  x: number;
  /**
   * the y coordinate of the clip in pixels.
   */
  y: number;
  /**
   * the width of the clip in pixels.
   */
  width: number;
  /**
   * the height of the clip in pixels.
   */
  height: number;
  /**
   * @defaultValue `1`
   */
  scale?: number;
}

export interface ScreenshotOptions {
  /**
   * @defaultValue `false`
   */
  optimizeForSpeed?: boolean;
  /**
   * @defaultValue `'png'`
   */
  type?: 'png' | 'jpeg' | 'webp';
  /**
   * Quality of the image, between 0-100. Not applicable to `png` images.
   */
  quality?: number;
  /**
   * Capture the screenshot from the surface, rather than the view.
   *
   * @defaultValue `true`
   */
  fromSurface?: boolean;
  /**
   * When `true`, takes a screenshot of the full page.
   *
   * @defaultValue `false`
   */
  fullPage?: boolean;
  /**
   * Hides default white background and allows capturing screenshots with transparency.
   *
   * @defaultValue `false`
   */
  omitBackground?: boolean;
  /**
   * The file path on the remote computer to save the image to. The screenshot type will be inferred
   * from file extension. If path is a relative path, then it is resolved
   * relative to current working directory. If no path is provided, the image
   * won't be saved to the disk.
   */
  remotePath?: string;
  /**
   * The local file path to save the image to. The screenshot type will be inferred
   * from file extension. If path is a relative path, then it is resolved
   * relative to current working directory. If no path is provided, the image
   * won't be saved to the disk.
   */
  localPath?: string;
  /**
   * Specifies the region of the page/element to clip.
   */
  clip?: ScreenshotClip;
  /**
   * Encoding of the image.
   *
   * @defaultValue `'binary'`
   */
  encoding?: 'base64' | 'binary';
  /**
   * Capture the screenshot beyond the viewport.
   *
   * @defaultValue `false` if there is no `clip`. `true` otherwise.
   */
  captureBeyondViewport?: boolean;
}
