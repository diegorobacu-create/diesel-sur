const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
document.documentElement.classList.add('js');
function closeMenu(returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header-inner')) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', () => closeMenu());
const form = document.querySelector('#inquiry-form');
form.hidden = false;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const vehicle = String(fields.get('vehicle') || '').trim();
  const service = String(fields.get('service') || '');
  const message = String(fields.get('message') || '').trim();
  if (!message) {
    document.querySelector('#message').setCustomValidity('Escribí brevemente tu consulta.');
    document.querySelector('#message').reportValidity();
    return;
  }
  const text = ['Hola Diesel Sur, quiero hacer una consulta.', `Servicio: ${service}`, vehicle ? `Vehículo: ${vehicle}` : '', `Consulta: ${message}`].filter(Boolean).join('\n');
  const url = `https://wa.me/5493518036358?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  const note = document.querySelector('#form-note');
  note.replaceChildren(document.createTextNode('Tu mensaje está listo. Si WhatsApp no se abrió, '));
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'continuá desde este enlace.';
  note.append(link);
});
document.querySelector('#message').addEventListener('input', (event) => event.target.setCustomValidity(''));
document.querySelector('#year').textContent = new Date().getFullYear();
