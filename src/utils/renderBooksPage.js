export function renderBooksPage(options = {}) {
  return {
    layout: 'layout',
    title: 'Books Review',
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
