export class DomainError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    this.isDomainError = true
  }
}