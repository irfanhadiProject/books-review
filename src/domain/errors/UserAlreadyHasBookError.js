import { DomainError } from './DomainError.js'

export class UserAlreadyHasBookError extends DomainError {
  constructor(message = 'User already has this book') {
    super(message)
  }
}