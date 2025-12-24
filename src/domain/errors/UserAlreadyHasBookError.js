import { ConflictError } from "./ConflictError.js";

export class UserAlreadyHasBookError extends ConflictError {
  constructor() {
    super('User already has this book')
    this.name = 'UserAlreadyHasBookError'
  }
}