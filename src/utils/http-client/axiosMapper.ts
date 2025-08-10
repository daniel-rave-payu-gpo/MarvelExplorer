import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import http from 'http';
import https from 'https';
import { HttpClientError, HttpClientOptions, HttpClientResponse } from './types';

export function toAxiosOptions(options: HttpClientOptions): AxiosRequestConfig {
  return {
    method: options?.method,
    baseURL: options?.url,
    url: options.path,
    params: options.query,
    headers: options?.headers,
    data: options?.body,
    timeout: options.timeout,
    httpAgent: options.keepAlive?.http && new http.Agent(options.keepAlive?.http),
    httpsAgent: options.keepAlive?.https && new https.Agent(options.keepAlive?.https),
    ctx: options.ctx,
  };
}

export function parseResponse<T>(response: AxiosResponse | AxiosError): HttpClientResponse<T> | HttpClientError {
  if (isAxiosError(response)) {
    const parsedResponse = {
      statusCode: response.status || undefined,
      body: response.response?.data as T,
      request: parseRequest(response),
      error: parseError(response),
    };
    return parsedResponse as HttpClientError;
  } else {
    const parsedResponse = {
      statusCode: response.status,
      body: response.data,
      headers: response.headers,
      request: parseRequest(response),
    };
    return parsedResponse as HttpClientResponse<T>;
  }
}

function isAxiosError(obj: AxiosResponse | AxiosError): obj is AxiosError {
  if (obj) {
    return typeof obj === 'object' && 'isAxiosError' in obj && obj.isAxiosError === true;
  } else {
    return false;
  }
}

function parseRequest(response: AxiosResponse | AxiosError) {
  const request = response.config as AxiosRequestConfig;
  if (!request) return {};
  const parsedRequest = {
    method: request.method?.toUpperCase(),
    url: request.baseURL,
    path: request.url,
    headers: request.headers,
    body: request.data,
  };
  return parsedRequest;
}

function parseError<T = unknown, D = unknown>(response: AxiosError<D, T>) {
  return {
    code: response.code,
    message: response.message,
    stack: response.stack,
    name: response.name,
  };
}
