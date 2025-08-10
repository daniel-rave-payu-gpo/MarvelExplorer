import http from 'http';
import https from 'https';
import { BaseLogger } from 'pino';
import { Histogram } from 'prom-client';

type Headers = Record<string, string>;

type Methods = 'post' | 'get';
// | 'delete'
// | 'patch'
// | 'put'
// | 'options'
// | 'POST'
// | 'GET'
// | 'DELETE'
// | 'PATCH'
// | 'PUT'
// | 'OPTIONS';

export interface HttpClientOptions {
  method?: Methods;
  url?: string;
  path?: string;
  query?: URLSearchParams;
  headers?: Headers;
  body?: unknown;
  retires?: unknown;
  timeout?: number;
  concurrency?: number;
  rateLimit?: number;
  logger?: BaseLogger;
  keepAlive?: KeepAlive;
  metrics?: { southboundHistogram?: Histogram; route?: string; host?: string };
  ctx?: Record<string, string | undefined>;
}

export interface HttpClientRequest {
  method: string;
  url: string;
  path: string;
  headers: http.OutgoingHttpHeaders;
  body: unknown;
}

export interface HttpClientResponse<T = unknown> {
  statusCode: number;
  body?: T;
  request: HttpClientRequest;
  headers: Record<string, number | string | string[]>;
}

export interface HttpClientError extends Omit<HttpClientResponse, 'statusCode'> {
  statusCode?: number | undefined;
  error: NodeJS.ErrnoException;
}

export interface KeepAlive {
  http?: http.AgentOptions;
  https?: https.AgentOptions;
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    ctx?: Record<string, string | undefined>;
  }

  interface AxiosRequestConfig {
    ctx?: Record<string, string | undefined>;
  }
}
