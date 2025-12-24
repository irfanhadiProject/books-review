import { AuthError } from "../domain/errors/AuthError.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { DatabaseError } from "../domain/errors/DatabaseError.js";
import { ValidationError } from "../domain/errors/ValidationError.js";
import { NotFoundError } from "../domain/errors/NotFoundError.js"

export function errorHandler(err, req, res, next) {
  if (err instanceof AuthError) {
    return res.status(401).json({
      error: 'AUTH_ERROR',
      message: err.message
    })
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: err.message
    })
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      error: 'CONFLICT',
      message: err.message
    })
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: err.message,
    })
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Internal server error'
    })
  }

  return res.status(500).json({
    error: 'UNKNOWN_ERROR',
    message: 'Unexpected error'
  })
}