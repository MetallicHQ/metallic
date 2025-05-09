import { ChartTypes, ExecutionError, Logs, RawData } from '../types/code-interpreter';

/**
 * Represents the data to be displayed as a result of executing a cell in a Jupyter notebook.
 * The result is similar to the structure returned by ipython kernel: https://ipython.readthedocs.io/en/stable/development/execution.html#execution-semantics
 *
 *
 * The result can contain multiple types of data, such as text, images, plots, etc. Each type of data is represented
 * as a string, and the result can contain multiple types of data. The display calls don't have to have text representation,
 * for the actual result the representation is always present for the result, the other representations are always optional.
 */
export class Result {
  /**
   * Text representation of the result.
   */
  readonly text: string | undefined;
  /**
   * HTML representation of the data.
   */
  readonly html: string | undefined;
  /**
   * Markdown representation of the data.
   */
  readonly markdown: string | undefined;
  /**
   * SVG representation of the data.
   */
  readonly svg: string | undefined;
  /**
   * PNG representation of the data.
   */
  readonly png: string | undefined;
  /**
   * JPEG representation of the data.
   */
  readonly jpeg: string | undefined;
  /**
   * PDF representation of the data.
   */
  readonly pdf: string | undefined;
  /**
   * LaTeX representation of the data.
   */
  readonly latex: string | undefined;
  /**
   * JSON representation of the data.
   */
  readonly json: string | undefined;
  /**
   * JavaScript representation of the data.
   */
  readonly javascript: string | undefined;
  /**
   * Contains the data from DataFrame.
   */
  readonly data: Record<string, unknown> | undefined;
  /**
   * Contains the chart data.
   */
  readonly chart: ChartTypes | undefined;
  /**
   * Extra data that can be included. Not part of the standard types.
   */
  readonly extra?: any;

  readonly raw: RawData;

  constructor(
    rawData: RawData,
    public readonly isMainResult: boolean
  ) {
    const data = { ...rawData };
    delete data['type'];
    delete data['is_main_result'];

    this.text = data['text'];
    this.html = data['html'];
    this.markdown = data['markdown'];
    this.svg = data['svg'];
    this.png = data['png'];
    this.jpeg = data['jpeg'];
    this.pdf = data['pdf'];
    this.latex = data['latex'];
    this.json = data['json'];
    this.javascript = data['javascript'];
    this.isMainResult = isMainResult;
    this.raw = data;

    this.data = data['data'];
    this.chart = data['chart'];

    this.extra = {};

    for (const key of Object.keys(data)) {
      if (
        ![
          'plain',
          'html',
          'markdown',
          'svg',
          'png',
          'jpeg',
          'pdf',
          'latex',
          'json',
          'javascript',
          'data',
          'chart',
          'extra',
          'text'
        ].includes(key)
      ) {
        this.extra[key] = data[key];
      }
    }
  }

  /**
   * Returns all the formats available for the result.
   *
   * @returns Array of strings representing the formats available for the result.
   */
  formats(): string[] {
    const formats = [];
    if (this.html) {
      formats.push('html');
    }
    if (this.markdown) {
      formats.push('markdown');
    }
    if (this.svg) {
      formats.push('svg');
    }
    if (this.png) {
      formats.push('png');
    }
    if (this.jpeg) {
      formats.push('jpeg');
    }
    if (this.pdf) {
      formats.push('pdf');
    }
    if (this.latex) {
      formats.push('latex');
    }
    if (this.json) {
      formats.push('json');
    }
    if (this.javascript) {
      formats.push('javascript');
    }
    if (this.data) {
      formats.push('data');
    }

    for (const key of Object.keys(this.extra)) {
      formats.push(key);
    }

    return formats;
  }

  /**
   * Returns the serializable representation of the result.
   */
  toJSON() {
    return {
      text: this.text,
      html: this.html,
      markdown: this.markdown,
      svg: this.svg,
      png: this.png,
      jpeg: this.jpeg,
      pdf: this.pdf,
      latex: this.latex,
      json: this.json,
      javascript: this.javascript,
      ...(Object.keys(this.extra).length > 0 ? { extra: this.extra } : {})
    };
  }
}

/**
 * Represents the result of a cell execution.
 */
export class Execution {
  constructor(
    /**
     * List of result of the cell (interactively interpreted last line), display calls (e.g. matplotlib plots).
     */
    public results: Result[] = [],
    /**
     * Logs printed to stdout and stderr during execution.
     */
    public logs: Logs = { stdout: [], stderr: [] },
    /**
     * An Error object if an error occurred, null otherwise.
     */
    public error?: ExecutionError,
    /**
     * Execution count of the cell.
     */
    public executionCount?: number
  ) {}

  /**
   * Returns the text representation of the main result of the cell.
   */
  get text(): string | undefined {
    for (const data of this.results) {
      if (data.isMainResult) {
        return data.text;
      }
    }
    return undefined;
  }

  /**
   * Returns the serializable representation of the execution result.
   */
  toJSON() {
    return {
      results: this.results,
      logs: this.logs,
      error: this.error
    };
  }
}
