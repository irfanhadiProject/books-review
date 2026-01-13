import { DomainError } from './DomainError.js'

export class UserBookNotFoundError extends DomainError {
  constructor(message = 'User book not found') {
    super(message)
  }
}
