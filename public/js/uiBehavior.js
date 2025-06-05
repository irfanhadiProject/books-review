document.addEventListener('DOMContentLoaded', function () {
  // Toggle Form
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

  // Sticky header on scroll
  const header = document.querySelector('.navbar__wrapper');
  const sticky = header.offsetTop;

  window.addEventListener('scroll', () => {
    if (window.scrollY > sticky) {
      header?.classList.add('navbar--sticky');
    } else {
      header?.classList.remove('navbar--sticky');
    }
  });
});
