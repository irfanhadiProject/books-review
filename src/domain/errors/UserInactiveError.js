import { DomainError } from './DomainError.js'

export class UserInactiveError extends DomainError {
  constructor(message = 'User account is inactive') {
    super(message)
  }
}