import { AuthError } from '../http/errors/AuthError.js'
import { ConflictError } from '../http/errors/ConflictError.js'
import { NotFoundError } from '../http/errors/NotFoundError.js'
import { DatabaseError } from '../http/errors/DatabaseError.js'
import { ValidationError } from '../http/errors/ValidationError.js'

export function errorHandler(err, req, res, next) {
  if (err instanceof AuthError) {
    return res.status(401).json({
      status: 'error',
      message: err.message || 'Session expired, please login'
    })
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      status: 'error',
      message: 'Invalid input',
      errors: err.details || {[err.name]: err.message}
    })
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      status: 'error',
      message: err.message
    })
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
    })
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    })
  }

  console.error('[UNHANDLED ERROR]', err)

  return res.status(500).json({
    status: 'error',
    message: 'Unexpected error'
  })
}