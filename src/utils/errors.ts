import { StatusCodes } from 'http-status-codes';

export class CustomError extends Error {
  public statusCode: number;

  constructor(error: { message: string; statusCode: number }) {
    super(error.message);
    this.statusCode = error.statusCode;
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super({ message: message, statusCode: StatusCodes.NOT_FOUND });
  }
}
