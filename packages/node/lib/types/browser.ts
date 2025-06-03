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
