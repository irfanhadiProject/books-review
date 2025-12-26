import { DomainError } from './DomainError'

export class UserInactiveError extends DomainError {
  constructor(message = 'User account is inactive') {
    super(message)
  }
}