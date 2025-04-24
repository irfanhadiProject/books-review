document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const toggleBtnMobile = document.getElementById("toggle-form-btn-mobile")
  const modal = document.getElementById('modal-overlay');
  const closeForm = document.getElementById('close-form-btn');

  toggleBtn.addEventListener('click', () => {
    modal.classList.toggle('hidden');
    toggleBtn.classList.toggle('hidden');
  });

  toggleBtnMobile.addEventListener('click', () => {
    modal.classList.toggle('hidden');
  });

  closeForm.addEventListener('click', () => {
    modal.classList.toggle('hidden');
    toggleBtn.classList.toggle('hidden');
  });
});
