const list = document.querySelector('#photoList');
const statusText = document.querySelector('#status');
const photoTotal = document.querySelector('#photoTotal');
let photos = [];

function updateTotal() { photoTotal.textContent = `${photos.length} photo${photos.length === 1 ? '' : 's'}`; }
function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}
function render() {
  list.innerHTML = photos.map((photo, index) => `
    <div class="photo-row" data-index="${index}">
      <img src="${escapeHtml(photo.src)}" alt="Preview ${index + 1}" onerror="this.style.opacity='.35'" />
      <div class="photo-fields">
        <input type="url" value="${escapeHtml(photo.src)}" placeholder="URL foto" aria-label="Image URL ${index + 1}" data-field="src" />
        <input type="text" value="${escapeHtml(photo.caption)}" placeholder="Tulis pesan untuk foto ini..." aria-label="Caption foto ${index + 1}" data-field="caption" />
      </div>
      <button class="remove-photo" type="button" aria-label="Remove photo">×</button>
    </div>`).join('');
  list.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('change', (event) => {
    const row = event.target.closest('.photo-row');
    photos[Number(row.dataset.index)][event.target.dataset.field] = event.target.value.trim();
  }));
  list.querySelectorAll('.remove-photo').forEach((button) => button.addEventListener('click', (event) => {
    photos.splice(Number(event.target.closest('.photo-row').dataset.index), 1);
    render();
  }));
  updateTotal();
}
function addPhoto(src = '') { photos.push({ src, caption: '' }); render(); }
async function load() {
  try {
    const response = await fetch('/api/photos', { cache: 'no-store' });
    const data = await response.json();
    photos = Array.isArray(data.photos) ? data.photos : [];
    if (data.storageReady === false) {
      statusText.textContent = 'Mode demo: sambungkan Vercel Blob agar perubahan bisa disimpan.';
      statusText.className = 'status error';
    }
  } catch (error) {
    statusText.textContent = 'Gagal mengambil data foto.';
    statusText.className = 'status error';
  }
  render();
}

document.querySelector('#addUrl').addEventListener('click', () => addPhoto());
document.querySelector('#uploadInput').addEventListener('change', (event) => {
  [...event.target.files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => addPhoto(reader.result);
    reader.readAsDataURL(file);
  });
  event.target.value = '';
});
document.querySelector('#savePhotos').addEventListener('click', async () => {
  const button = document.querySelector('#savePhotos');
  const validPhotos = photos.filter((photo) => photo.src.trim());
  if (!validPhotos.length) {
    statusText.textContent = 'Tambahkan minimal satu foto dulu.';
    statusText.className = 'status error';
    return;
  }
  button.disabled = true;
  statusText.textContent = 'Menyimpan...';
  statusText.className = 'status';
  try {
    const response = await fetch('/api/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photos: validPhotos }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Gagal menyimpan');
    photos = data.photos;
    render();
    statusText.textContent = 'Foto berhasil diperbarui.';
    statusText.className = 'status success';
  } catch (error) {
    statusText.textContent = error.message;
    statusText.className = 'status error';
  } finally { button.disabled = false; }
});
load();
