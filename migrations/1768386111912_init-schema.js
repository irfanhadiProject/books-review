/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(50)', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    is_active: { type: 'boolean', notNull: true, default: true },
    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
    },
  })

  pgm.createTable('books', {
    id: 'id',
    cover: { type: 'text' },
    title: { type: 'varchar(50)', notNull: true },
    genre: { type: 'text' },
    author: { type: 'text' },
    isbn: { type: 'text' },
  })

  pgm.addConstraint(
    'books',
    'books_title_not_empty',
    {
      check: 'TRIM(title) <> \'\'',
    }
  )

  pgm.createIndex(
    'books',
    'isbn',
    {
      unique: true,
      where: 'isbn IS NOT NULL',
      name: 'books_isbn_unique',
    }
  )

  pgm.createTable('user_books', {
    id: 'id',
    user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'CASCADE',
    },
    book_id: {
      type: 'integer',
      references: 'books',
      onDelete: 'CASCADE',
    },
    read_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    setting: { type: 'varchar(50)' },
    readability: { type: 'varchar(50)' },
    words: { type: 'varchar(50)' },
    summary: { type: 'text' },
  })

  pgm.addConstraint(
    'user_books',
    'unique_user_book',
    {
      unique: ['user_id', 'book_id'],
    }
  )
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('user_books')
  pgm.dropTable('books')
  pgm.dropTable('users')
}

