document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const form = document.getElementById('book-form');

  toggleBtn.addEventListener('click', () => {
    form.classList.toggle('hidden');
    toggleBtn.textContent = form.classList.contains('hidden')
      ? 'Add Book'
      : 'Hide Form';
  });
});
