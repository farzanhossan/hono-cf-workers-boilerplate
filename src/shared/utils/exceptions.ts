export class HttpException extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public cause?: any
  ) {
    super(message);
    this.name = "HttpException";
  }

  getStatus() {
    return this.statusCode;
  }

  getResponse() {
    return { message: this.message };
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message: string = "Too Many Requests") {
    super(message, 429);
  }
}
