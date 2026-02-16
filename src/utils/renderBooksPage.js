export function renderBooksPage(options = {}) {
  return {
    layout: 'layout',
    title: 'Books Review',

    // modal config
    formTitle: options.formTitle || 'Add Book',
    formAction: options.formAction || '/books/add-book',
    submitText: options.submitText || 'Add',
    book: options.book ? mapBookToFormModel(options.book) : null,

    // layout flags
    showHeader: true,
    showFooter: true,

    // page data
    user: options.user || '',
    books: (options.books || []).map(mapBookToViewModel),
  }
}

function mapBookToViewModel(book) {
  return {
    id: book.user_book_id,
    readAt: book.read_at,
    title: book.title,
    genre: book.genre,
    author: book.author,
    cover: book.cover,
    setting: book.setting,
    readability: book.readability,
    keywords: book.words,
    summary: book.summary
  }
}

function mapBookToFormModel(book) {
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    genre: book.genre,
    setting: book.setting,
    readability: book.readability,
    keywords: book.words,
    summary: book.summary
  }
}
