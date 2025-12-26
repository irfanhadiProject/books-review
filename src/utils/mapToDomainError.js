import { DatabaseError } from '../domain/errors/DatabaseError.js'

export function mapToDomainError(err) {
  if (err?.isDomainError) {
    return err
  }

  if (err.code || err.name === 'DatabaseError') {
    return new DatabaseError()
  }

  throw err
}