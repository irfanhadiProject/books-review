import { DomainError } from './DomainError.js'

export class InvalidPasswordError extends DomainError {
  constructor(message = 'Invalid password') {
    super(message)
  }
}