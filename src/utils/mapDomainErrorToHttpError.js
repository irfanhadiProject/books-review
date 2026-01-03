import { ValidationError as DomainValidationError } from '../domain/errors/ValidationError.js'
import { UserAlreadyHasBookError } from '../domain/errors/UserAlreadyHasBookError.js'
import { DatabaseError as DomainDatabaseError } from '../domain/errors/DatabaseError.js'
import { UserNotFoundError } from '../domain/errors/UserNotFoundError.js'

import { ValidationError } from '../http/errors/ValidationError.js'
import { ConflictError } from '../http/errors/ConflictError.js'
import { DatabaseError } from '../http/errors/DatabaseError.js'
import { AuthError } from '../http/errors/AuthError.js'
import { InvalidPasswordError } from '../domain/errors/InvalidPasswordError.js'
import { UserInactiveError } from '../domain/errors/UserInactiveError.js'

export function mapDomainErrorToHttpError(err) {
  if (err instanceof DomainValidationError) {
    return new ValidationError(err.message)
  }

  if (err instanceof UserAlreadyHasBookError) {
    return new ConflictError(err.message)
  }

  if (
    err instanceof UserNotFoundError || 
    err instanceof InvalidPasswordError || 
    err instanceof UserInactiveError
  ) {
    return new AuthError('Invalid username or password')
  }

  if (err instanceof DomainDatabaseError) {
    return new DatabaseError()
  }

  return err
}
