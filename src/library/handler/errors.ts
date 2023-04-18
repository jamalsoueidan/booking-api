import { ZodError } from "zod";

export class UnauthorizedError extends ZodError {
  status = 401;
}

export class NotFoundError extends ZodError {
  status = 404;
}

export class ForbiddenError extends ZodError {
  status = 403;
}

export class BadError extends ZodError {
  status = 400;
}
