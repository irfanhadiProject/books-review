document.addEventListener('DOMContentLoaded', function () {
  // Toggle Form
  const toggleBtns = document.querySelectorAll('.read-books__toolbar-add-btn')
  const modal = document.getElementById('modal-overlay')
  const closeForm = document.getElementById('close-form-btn')

  toggleBtns.forEach((toggleBtn) => {
    toggleBtn.addEventListener('click', () => {
      const form = document.getElementById('book-form')
      form.reset()
      form.action = '/books/add-book'
      form.querySelector('.book-form__title').textContent = 'Add Book'
      form.querySelector('.book-form__submit-btn').textContent = 'Add'

      form.title.disabled = false
      form.author.disabled = false
      form.isbn.disabled = false
      form.genre.disabled = false

      modal.classList.remove('hidden')
    })
  })

  if (closeForm) {
    closeForm.addEventListener('click', (e) => {
      e.preventDefault()
      modal?.classList.add('hidden')
    })
  }

  // Sticky header on scroll
  const header = document.querySelector('.navbar__wrapper')
  const sticky = header.offsetTop

  window.addEventListener('scroll', () => {
    if (window.scrollY > sticky) {
      header?.classList.add('navbar--sticky')
    } else {
      header?.classList.remove('navbar--sticky')
    }
  })

  // Read books toolbar menu toggle
  const menuToggle = document.getElementById('menu-toggle')
  const menuContent = document.querySelector(
    '.read-books__toolbar-menu-content'
  )

  menuToggle.addEventListener('click', () => {
    menuContent.classList.toggle('show')
  })

  // Submit sort by form
  const sortForm = document.getElementById('sort-form')
  const sortSelect = document.getElementById('sort-select')

  sortSelect.addEventListener('change', () => {
    sortForm.submit()
  })

  // Edit book
  document.querySelectorAll('.book-card__edit-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const bookId = button.dataset.id

      const res = await fetch(`/books/${bookId}`)
      const book = await res.json()

      document.querySelector('.book-form__title').textContent = 'Edit Book'
      const form = document.getElementById('book-form')
      form.action = `/books/${bookId}?_method=PATCH`
      form.querySelector('.book-form__submit-btn').textContent = 'Update'

      form.title.value = book.title
      form.author.value = book.author
      form.isbn.value = book.isbn
      form.genre.value = book.genre
      form.setting.value = book.setting
      form.readability.value = book.readability
      form.words.value = book.words
      form.summary.value = book.summary

      form.title.disabled = true
      form.author.disabled = true
      form.isbn.disabled = true
      form.genre.disabled = true

      modal.classList.remove('hidden')
    })
  })

  // Delete book
  document.querySelectorAll('.book-card__delete-btn').forEach((button) =>
    button.addEventListener('click', async () => {
      const bookId = button.dataset.id

      const confirmDelete = confirm(
        'Are you sure you want to delete this book?'
      )

      if (!confirmDelete) return

      const res = await fetch(`/books/${bookId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Book deleted!')
        location.reload()
      } else {
        alert('Failed to delete book.')
      }
    })
  )
})
