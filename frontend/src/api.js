export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.104.201:3001';

export const getFotoUrl = (pub) => {
  if (!pub) return '/placeholder.png';
  const img = typeof pub === 'object'
    ? (pub.imagen_url || pub.imagen || pub.foto || pub.imagenUrl || pub.foto_url || pub.image)
    : pub;

  if (!img || typeof img !== 'string') return '/placeholder.png';

  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }

  const filename = img.startsWith('/uploads/') ? img.substring(9) : (img.startsWith('/') ? img.substring(1) : img);
  return `${API_BASE_URL}/uploads/${filename}`;
};

export default API_BASE_URL;
