const { list, put } = require('@vercel/blob');

const DATA_PATH = 'selia-photo-letter/photos.json';
const fallbackPhotos = [
  {
    src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1800&q=85',
    caption: 'Buat kamu, sayang. Semoga hari kamu selalu seindah senyummu.'
  },
  {
    src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1800&q=85',
    caption: 'Terima kasih sudah menjadi rumah paling nyaman untukku.'
  },
  {
    src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=85',
    caption: 'Aku pilih kamu, hari ini, besok, dan setiap hari.'
  }
];

function cleanPhotos(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((photo) => photo && typeof photo.src === 'string' && (/^https?:\/\//i.test(photo.src) || /^data:image\//i.test(photo.src)))
    .slice(0, 24)
    .map((photo) => ({
      src: photo.src.trim().slice(0, 5_500_000),
      caption: typeof photo.caption === 'string' ? photo.caption.trim().slice(0, 180) : ''
    }));
}

async function readPhotos() {
  const result = await list({ prefix: DATA_PATH });
  const blob = result.blobs.find((item) => item.pathname === DATA_PATH);
  if (!blob) return fallbackPhotos;

  const response = await fetch(blob.url, { cache: 'no-store' });
  const saved = cleanPhotos(await response.json());
  return saved.length ? saved : fallbackPhotos;
}

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(204).end();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(200).json({ photos: fallbackPhotos, storageReady: false });
  }

  try {
    if (request.method === 'GET') {
      return response.status(200).json({ photos: await readPhotos(), storageReady: true });
    }

    if (request.method === 'POST') {
      const photos = cleanPhotos(request.body && request.body.photos);
      if (!photos.length) {
        return response.status(400).json({ error: 'Tambahkan minimal satu foto dengan URL yang valid.' });
      }

      await put(DATA_PATH, JSON.stringify(photos), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return response.status(200).json({ photos, storageReady: true });
    }

    return response.status(405).json({ error: 'Method tidak didukung.' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Storage belum siap. Pastikan BLOB_READ_WRITE_TOKEN sudah dipasang di Vercel.' });
  }
};
