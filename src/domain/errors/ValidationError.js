import { DomainError } from "./DomainError.js"

export class ValidationError extends DomainError {
  constructor(message = 'Validation failed') {
    super(message)
  }
}