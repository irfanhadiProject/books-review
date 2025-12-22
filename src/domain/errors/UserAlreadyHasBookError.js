export class UserAlreadyHasBookError extends Error {
  constructor(message = 'User already has this book') {
    super(message);
    this.name = 'UserAlreadyHasBookError'
  }
}