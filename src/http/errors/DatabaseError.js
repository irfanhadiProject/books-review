export class DatabaseError extends Error {
  constructor(message = 'Internal server error') {
    super(message)
    this.name = 'DatabaseError'
  }
}