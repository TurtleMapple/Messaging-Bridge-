/**
 * Base MessagingError class following SRP (data carrier).
 * Includes captureStackTrace for detailed debugging.
 */
export class MessagingError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errorCode: string = 'INTERNAL_ERROR',
    public data?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown for client input validation failures (400).
 * Supports field-specific error details.
 */
export class ValidationError extends MessagingError {
  constructor(message: string, data?: { field: string; message: string }[]) {
    super(message, 400, 'VALIDATION_ERROR', data);
  }
}

/**
 * Thrown for authentication failures (401).
 */
export class UnauthorizedError extends MessagingError {
  constructor(message: string = 'Unauthorized: Invalid or missing API key') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Thrown when a requested resource or route is not found (404).
 */
export class NotFoundError extends MessagingError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Thrown when the service is not ready to handle requests (503).
 */
export class ServiceUnavailableError extends MessagingError {
  constructor(message: string) {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}
