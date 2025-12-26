import { DomainError } from './DomainError'

export class InvalidPasswordError extends DomainError {
  constructor(message = 'Invalid password') {
    super(message)
  }
}