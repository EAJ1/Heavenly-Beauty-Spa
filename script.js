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
  body: 'Body massage — R700 · 60 minutes. Let us know your preferred pressure and areas of focus.',
  feet: 'Foot massage — R300 · 30 minutes. A little time to rest your feet.',
  makeup: 'Makeup — R400. Tell us about your occasion and preferred look. Ask about duration when booking.',
  nails: 'Nails — R250. Tell us your preferred nail look. Confirm the details and duration when booking.'
};
const treatmentDurations = { body: 60, feet: 30 };
function updateBookingHours() {
  const sunday = dateInput.value && new Date(`${dateInput.value}T12:00:00Z`).getUTCDay() === 0;
  const opening = sunday ? 13 * 60 : 8 * 60;
  const closing = sunday ? 16 * 60 : 18 * 60;
  const duration = treatmentDurations[form.elements.service.value];
  const format = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  const time = form.elements.time;
  time.min = format(opening);
  time.max = format(closing - (duration || 1));
  document.querySelector('#whatsapp-fallback').hidden = true;
  document.querySelector('#time-help').textContent = dateInput.value
    ? `${sunday ? 'Sunday hours: 1pm–4pm.' : 'Monday–Saturday hours: 8am–6pm.'} Request a start time between ${time.min} and ${time.max} (South Africa time). ${duration ? `Allow ${duration} minutes for your massage.` : 'The spa will confirm your treatment length and finish time.'} Availability is confirmed on WhatsApp.`
    : 'Monday–Saturday: 8am–6pm. Sunday: 1pm–4pm. Choose a date to see request times (South Africa time).';
}
dateInput.addEventListener('change', updateBookingHours);
form.addEventListener('input', () => {
  document.querySelector('#whatsapp-fallback').hidden = true;
  status.textContent = '';
});
function updateTreatmentSummary() {
  updateBookingHours();
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
  updateBookingHours();
  if (!form.reportValidity()) return;
  if (form.elements.time.value < form.elements.time.min || form.elements.time.value > form.elements.time.max) {
    status.textContent = `Please choose a start time between ${form.elements.time.min} and ${form.elements.time.max}.`;
    return;
  }
  const selectedDate = new Date(`${dateInput.value}T${form.elements.time.value}:00+02:00`);
  if (selectedDate <= new Date()) {
    status.textContent = 'Please choose a date and time in the future.';
    return;
  }
  const service = form.elements.service.selectedOptions[0].textContent;
  const message = `Hello Heavenly Beauty Spa! I’d like to request an appointment.\n\nTreatment: ${service}\nPreferred date: ${dateInput.value}\nPreferred time: ${form.elements.time.value} (South Africa time)\n${form.elements.notes.value.trim() ? `Notes: ${form.elements.notes.value.trim()}\n` : ''}\nLocation: BT Ngebs, Mthatha. Please confirm availability${treatmentDurations[form.elements.service.value] ? "" : " and treatment duration"}. Thank you!`;
  const url = `https://wa.me/27829903660?text=${encodeURIComponent(message)}`;
  const fallback = document.querySelector('#whatsapp-fallback');
  fallback.href = url;
  fallback.hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
  status.textContent = 'Review your request and tap Send in WhatsApp. If WhatsApp did not open, use the link below. Your appointment is confirmed only after the spa replies.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
