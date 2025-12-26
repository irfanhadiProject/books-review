import { DomainError } from "./DomainError.js"

export class DatabaseError extends DomainError {
  constructor(message = 'Database error') {
    super(message)
  }
}