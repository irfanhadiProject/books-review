export function renderBooksPage(options = {}) {
  return {
    layout: 'layout',
    title: 'Books Review',

    // modal config
    formTitle: options.formTitle || 'Add Book',
    formAction: options.formAction || '/books',
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

function mapBookToViewModel(bookApiData) {
  return {
    id: bookApiData.id,
    title: bookApiData.book.title,
    author: bookApiData.book.author,
    cover: bookApiData.book.coverUrl,
    readAt: bookApiData.read_at,
    genre: bookApiData.genre,
    setting: bookApiData.setting,
    readability: bookApiData.readability,
    keywords: bookApiData.words,
    summary: bookApiData.summary
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
