import { ValidationError as DomainValidationError } from '../domain/errors/ValidationError.js'
import { UserAlreadyHasBookError } from '../domain/errors/UserAlreadyHasBookError.js'
import { DatabaseError as DomainDatabaseError } from '../domain/errors/DatabaseError.js'

import { ValidationError } from '../http/errors/ValidationError.js'
import { ConflictError } from '../http/errors/ConflictError.js'
import { DatabaseError } from '../http/errors/DatabaseError.js'

export function mapDomainErrorToHttpError(err) {
  if (err instanceof DomainValidationError) {
    return new ValidationError(err.message)
  }

  if (err instanceof UserAlreadyHasBookError) {
    return new ConflictError(err.message)
  }

  if (err instanceof DomainDatabaseError) {
    return new DatabaseError()
  }

  return err
}
