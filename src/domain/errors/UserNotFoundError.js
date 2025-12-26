import { DomainError } from "./DomainError.js";

export class UserNotFoundError extends DomainError {
  constructor(message = 'User not found') {
    super(message)
  }
}