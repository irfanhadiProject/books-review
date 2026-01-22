export class ValidationError extends Error {
  constructor(message = 'Validation failed', details = null) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}