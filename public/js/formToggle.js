document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const modal = document.getElementById('modal-overlay');
  const closeForm = document.getElementById('close-form-btn');

  toggleBtn.addEventListener('click', () => {
    modal.classList.toggle('hidden');
    toggleBtn.classList.toggle('hidden');
  });

  closeForm.addEventListener('click', () => {
    modal.classList.toggle('hidden');
    toggleBtn.classList.toggle('hidden');
  });
});
