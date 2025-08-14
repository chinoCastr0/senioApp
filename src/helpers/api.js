// src/helpers/api.js
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const toURL = (path) => {
  if (!path) return BASE_URL;
  return path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export async function postJSON(path, data, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(toURL(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Error ${res.status}: ${text || res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('La solicitud tardó demasiado (timeout).');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export async function postForm(path, formData, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(toURL(path), {
      method: 'POST',
      body: formData, // el browser setea multipart/form-data
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Error ${res.status}: ${text || res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('La solicitud tardó demasiado (timeout).');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// (Opcional) helpers útiles:
export async function getJSON(path, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(toURL(path), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
export async function postFormBlob(path, formData, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(toURL(path), { method: 'POST', body: formData, signal: ctrl.signal });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.blob();
  } finally {
    clearTimeout(t);
  }
}
export const toAbsoluteURL = (u) => (u?.startsWith('http') ? u : toURL(u));
