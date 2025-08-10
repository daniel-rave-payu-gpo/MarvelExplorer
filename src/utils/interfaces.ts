import { StatusCodes } from 'http-status-codes';
export interface ControllerResponse<T = unknown> {
  statusCode: StatusCodes;
  response: T;
}
