export function renderBooksPage(options = {}) {
  return {
    layout: options.layout || 'layout',
    title: options.title || 'Books Review',
    formTitle: options.formTitle || 'Add Book',
    formAction: options.formAction || '/books/add-book',
    submitText: options.submitText || 'Add',
    book: options.book || null,
    showHeader: true,
    showFooter: true,
    user: options.user,
    booksData: options.booksData || [],
  }
}
