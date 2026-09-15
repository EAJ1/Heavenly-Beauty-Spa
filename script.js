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
  body: 'Body massage — R700. Let us know your preferred pressure and areas of focus. Ask about duration when booking.',
  feet: 'Foot massage — R300. A little time to rest your feet. Ask about duration when booking.',
  makeup: 'Makeup — R400. Tell us about your occasion and preferred look. Ask about duration when booking.',
  nails: 'Nails — R250. Tell us your preferred nail look. Confirm the details and duration when booking.'
};
function updateTreatmentSummary() {
  document.querySelector('#treatment-summary').textContent = treatmentDescriptions[form.elements.service.value] || 'Select a treatment to see what to expect.';
}
form.elements.service.addEventListener('change', updateTreatmentSummary);
function localDate() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  dateInput.min = localDate();
  if (button.dataset.book) form.elements.service.value = button.dataset.book;
  status.textContent = '';
  document.querySelector('#whatsapp-fallback').hidden = true;
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
  const selectedDate = new Date(`${dateInput.value}T${form.elements.time.value}:00+02:00`);
  if (selectedDate <= new Date()) {
    status.textContent = 'Please choose a date and time in the future.';
    return;
  }
  const service = form.elements.service.selectedOptions[0].textContent;
  const message = `Hello Heavenly Beauty Spa! I’d like to request an appointment.\n\nTreatment: ${service}\nPreferred date: ${dateInput.value}\nPreferred time: ${form.elements.time.value} (South Africa time)\n${form.elements.notes.value.trim() ? `Notes: ${form.elements.notes.value.trim()}\n` : ''}\nPlease confirm availability, treatment duration, and your exact location in Mthatha. Thank you!`;
  const url = `https://wa.me/27829903660?text=${encodeURIComponent(message)}`;
  const fallback = document.querySelector('#whatsapp-fallback');
  fallback.href = url;
  fallback.hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
  status.textContent = 'Review your request and tap Send in WhatsApp. If WhatsApp did not open, use the link below. Your appointment is confirmed only after the spa replies.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
