export class AuthError extends Error {
  constructor (message = 'Unauthorized') {
    super(message)
    this.name = 'AuthError'
  }
}