const fallbackPhotos = [
  { src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1800&q=85', caption: 'Buat kamu, sayang. Semoga hari kamu selalu seindah senyummu.' },
  { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1800&q=85', caption: 'Terima kasih sudah menjadi rumah paling nyaman untukku.' },
  { src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=85', caption: 'Aku pilih kamu, hari ini, besok, dan setiap hari.' }
];
let photos = fallbackPhotos;
let activeIndex = 0;
const image = document.querySelector('#heroImage');
const caption = document.querySelector('#photoCaption');
const currentNumber = document.querySelector('#currentNumber');
const totalNumber = document.querySelector('#totalNumber');
const dots = document.querySelector('#dots');

function renderDots() {
  dots.innerHTML = photos.map((_, index) => `<button class="dot ${index === activeIndex ? 'active' : ''}" aria-label="Photo ${index + 1}" data-index="${index}"></button>`).join('');
  dots.querySelectorAll('.dot').forEach((dot) => dot.addEventListener('click', () => showPhoto(Number(dot.dataset.index))));
}

function showPhoto(index) {
  activeIndex = (index + photos.length) % photos.length;
  image.classList.remove('loaded');
  image.onload = () => image.classList.add('loaded');
  image.src = photos[activeIndex].src;
  image.alt = photos[activeIndex].caption || `Memory ${activeIndex + 1}`;
  caption.textContent = photos[activeIndex].caption || '';
  currentNumber.textContent = String(activeIndex + 1).padStart(2, '0');
  totalNumber.textContent = String(photos.length).padStart(2, '0');
  renderDots();
}

async function loadPhotos() {
  try {
    const response = await fetch('/api/photos');
    if (!response.ok) throw new Error('Could not load photos');
    const data = await response.json();
    if (Array.isArray(data.photos) && data.photos.length) photos = data.photos;
  } catch (error) {
    console.info('Using default photos.', error);
  }
  showPhoto(0);
}

document.querySelector('#previousPhoto').addEventListener('click', () => showPhoto(activeIndex - 1));
document.querySelector('#nextPhoto').addEventListener('click', () => showPhoto(activeIndex + 1));
document.querySelector('#openSidebar').addEventListener('click', () => document.querySelector('#sidebar').classList.add('open'));
const closeSidebar = () => document.querySelector('#sidebar').classList.remove('open');
document.querySelector('#closeSidebar').addEventListener('click', closeSidebar);
document.querySelector('#closeSidebarButton').addEventListener('click', closeSidebar);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSidebar(); });
loadPhotos();
