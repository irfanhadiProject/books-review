import { DatabaseError } from '../domain/errors/DatabaseError.js'
import { UserAlreadyHasBookError } from '../domain/errors/UserAlreadyHasBookError.js'

export function mapToDomainError(err) {
  if (err?.isDomainError) {
    return err
  }

  if (err.code === '23505' && err.constraint === 'unique_user_book') {
    return new UserAlreadyHasBookError()
  }

  if (err.code) {
    return new DatabaseError()
  }

  throw err
}