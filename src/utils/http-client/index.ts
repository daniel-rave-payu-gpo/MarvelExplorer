import axios, { AxiosError } from 'axios';
import Bottleneck from 'bottleneck';
import { Histogram } from 'prom-client';
import { parseResponse, toAxiosOptions } from './axiosMapper';
import TimeDiff from './timediff';
import { HttpClientError, HttpClientOptions, HttpClientResponse } from './types';

export class HttpClient {
  private southboundHistogram: Histogram | undefined;
  private client: unknown;

  private constructor(private options: HttpClientOptions) {
    const client = axios.create(toAxiosOptions(options));

    if (options.headers) {
      client.interceptors.request.use(config => {
        Object.assign(config.headers, options.headers);
        return config;
      });
    }
    if (options.logger) {
      client.interceptors.response.use(
        response => {
          const mappedResponse = parseResponse(response);

          options.logger?.info(
            {
              ...(response.config.ctx || {}),
              request: {
                url: `${mappedResponse.request.url}${mappedResponse.request.path || ''}`,
                body: mappedResponse.request.body,
              },
              response: {
                status_code: mappedResponse.statusCode,
                body: mappedResponse.body,
              },
            },
            'outgoing request',
          );
          return response;
        },
        error => {
          const mappedResponse = parseResponse(error) as HttpClientError;
          options.logger?.error(
            {
              request: mappedResponse.request,
              error: mappedResponse.error,
              response: { ...mappedResponse, request: undefined, error: undefined },
            },
            'outgoing request',
          );
          throw error;
        },
      );
    }
    this.southboundHistogram = options.metrics?.southboundHistogram;
    this.client = new Bottleneck({
      minTime: options.rateLimit ? 1000 / options.rateLimit : undefined,
      maxConcurrent: options.concurrency ? options.concurrency : undefined,
    }).wrap(client);
  }

  static createInstance(options: HttpClientOptions = {}): HttpClient {
    const client = new HttpClient(options);
    return client;
  }

  extend(options: HttpClientOptions): HttpClient {
    const newOptions: HttpClientOptions = {
      ...this.options,
      ...options,
    };
    return new HttpClient(newOptions);
  }

  post<T = unknown>(options: HttpClientOptions): Promise<HttpClientResponse<T>> {
    return this.send<T>({
      method: 'post',
      ...options,
    });
  }

  get<T = unknown>(options: HttpClientOptions): Promise<HttpClientResponse<T>> {
    return this.send<T>({
      method: 'get',
      ...options,
    });
  }

  private async send<T = unknown>(options: HttpClientOptions): Promise<HttpClientResponse<T>> {
    const timeDiff = TimeDiff.startMeasurement();
    const method = options?.method;
    try {
      const { target, metricsRoute } = this.extractUrlLabels(options);
      const axiosOptions = toAxiosOptions(options);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = await this.client(axiosOptions);
      const mappedResponse = parseResponse<T>(response) as HttpClientResponse<T>;

      this.southboundHistogram?.observe(
        { route: metricsRoute, method, status_code: mappedResponse.statusCode, target },
        timeDiff.getTimeSinceStart() / 1000,
      );

      return mappedResponse;
    } catch (error) {
      const axiosError = parseResponse(error as AxiosError);
      let errorName;
      if ('error' in axiosError) {
        errorName = axiosError.error?.name;
      }
      const { target, metricsRoute } = this.extractUrlLabels(options);
      this.southboundHistogram?.observe(
        { route: metricsRoute, method, status_code: axiosError.statusCode, target, error: errorName },
        timeDiff.getTimeSinceStart() / 1000,
      );
      throw axiosError;
    }
  }

  private extractUrlLabels(options: HttpClientOptions) {
    const { route, host } = options.metrics || {};
    const url = options.path?.startsWith('http')
      ? options.path
      : (options.url || this.options.url || '') + (options.path || this.options.path || '');
    const fullUrl = new URL(url);

    return { metricsRoute: route || fullUrl.pathname, target: host || fullUrl.host };
  }
}

export * from './types';
