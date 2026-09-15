const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));
const dialog = document.querySelector('#booking-dialog');
const form = document.querySelector('#booking-form');
const dateInput = document.querySelector('#date');
const status = document.querySelector('#booking-status');
const treatmentDescriptions = {
  massage: 'A relaxing massage to help you unwind. Discuss your preferred pressure and areas of focus with the spa.',
  facial: 'Cleansing and nourishing facial care. Discuss your skin-care preferences with the spa.',
  scrub: 'An exfoliating body ritual for a refreshed, softer feel. Confirm the treatment details with the spa.',
  hair: 'Hair care and styling for a fresh finish. Discuss your preferred style and treatment with the spa.'
};
function updateTreatmentSummary() {
  document.querySelector('#treatment-summary').textContent = treatmentDescriptions[form.elements.service.value] || 'Select a treatment to see what to expect.';
}
form.elements.service.addEventListener('change', updateTreatmentSummary);
function localDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  dateInput.min = localDate();
  if (button.dataset.book) form.elements.service.value = button.dataset.book;
  status.textContent = '';
  updateTreatmentSummary();
  dialog.showModal();
}));
document.querySelector('.close-button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  dateInput.min = localDate();
  if (!form.reportValidity()) return;
  const selectedDate = new Date(`${dateInput.value}T${form.elements.time.value}`);
  if (selectedDate <= new Date()) {
    status.textContent = 'Please choose a date and time in the future.';
    return;
  }
  const service = form.elements.service.selectedOptions[0].textContent;
  const plan = `HEAVENLY BEAUTY SPA — VISIT PLAN\n\nTreatment: ${service}\nPreferred date: ${dateInput.value}\nPreferred time: ${form.elements.time.value}\nNotes: ${form.elements.notes.value || 'None'}\n\nThis plan has not been sent to the spa and does not reserve an appointment. Contact the spa directly to confirm availability and pricing.\n`;
  const url = URL.createObjectURL(new Blob([plan], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'heavenly-spa-visit-plan.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Your visit plan is ready to download. It has not been sent to the spa. Please contact the spa to confirm your appointment.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
