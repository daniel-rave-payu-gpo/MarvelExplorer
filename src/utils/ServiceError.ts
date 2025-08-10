import { FastifyError, ValidationResult } from 'fastify';
import { SchemaErrorDataVar } from 'fastify/types/schema';

type ServiceErrorInterface = Omit<FastifyError, 'validation' | 'name'> & { statusCode: number } & {
  validation?: Partial<ValidationResult>[];
  name?: string;
  details?: string;
};

export class ServiceError implements ServiceErrorInterface {
  code: string;
  message: string;
  statusCode: number;
  validationContext?: SchemaErrorDataVar | undefined;
  name?: string;
  stack?: string | undefined;
  validation?: Partial<ValidationResult>[] | undefined;
  details?: string;
  constructor(error: ServiceErrorInterface) {
    this.code = error.code;
    this.name = error.name;
    this.details = error.details;
    this.message = error.message;
    this.stack = error.stack;
    this.statusCode = error.statusCode;
    this.validationContext = error.validationContext;
    this.validation = error.validation;
  }
}
