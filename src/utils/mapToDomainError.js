import { ValidationError } from '../domain/errors/ValidationError.js'
import { UserAlreadyHasBookError } from '../domain/errors/UserAlreadyHasBookError.js'
import { DatabaseError } from '../domain/errors/DatabaseError.js'

export function mapToDomainError(err) {
  if (err instanceof ValidationError || err instanceof UserAlreadyHasBookError) {
    return err
  }

  if (err.code === '23505') {
    return new UserAlreadyHasBookError()
  }

  return new DatabaseError(err.message)
}