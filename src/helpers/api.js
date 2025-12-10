// src/helpers/api.js

// Detecta dinámicamente el backend.
// - Si hay VITE_API_URL, usa esa.
// - Si no, arma una URL con el host actual y puerto 8000.
//   Ej: front en http://192.168.1.40:5173 => API http://192.168.1.40:8000
const getBaseURL = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env) return env.replace(/\/$/, '');

  const { protocol, hostname } = window.location;
  const proto = protocol === 'https:' ? 'https' : 'http';

  const guessed =
    hostname === 'localhost' || hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : `${proto}://${hostname}:8000`;

  return guessed.replace(/\/$/, '');
};

// Exporto por si querés loguearlo/debuguearlo
export const BASE_URL = getBaseURL();

export const toURL = (path) => {
  const base = getBaseURL(); // recalcula por si cambió la IP y recargaste la página
  if (!path) return base;
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const toAbsoluteURL = (u) => (u?.startsWith('http') ? u : toURL(u));

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Core request con timeout y parseo flexible
async function request(method, path, {
  headers = {},
  body,
  timeoutMs = 12000,
  responseType = 'json', // 'json' | 'blob' | 'text'
  retries = 2, //cuantos reintentos extras
  retryDelayMs = 1000, //delay inicial entre intentos
  backoffFactor = 1.5, //crece el delay
} = {}) {

  let attempt = 0;

  while (true) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(toURL(path), { method, headers, body, signal: ctrl.signal });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`Error ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
    }

    if (responseType === 'blob') return await res.blob();
    if (responseType === 'text') return await res.text();
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error('La solicitud tardó demasiado (timeout).');
      timeoutError.isTimeout = true;
    }

    const status = err.status;
    const isTimeout = err.isTimeout || err.name ==='AbortError';
    const isNetworkError = err.name === 'TypeError';
    const isServerError = typeof status === 'number' && status >= 500 && status < 600;

    const shouldRetry =
    attempt < retries && (isTimeout || isNetworkError || isServerError);

    if (!shouldRetry){
      console.error('[API] ${method} ${toURL(path)} →', err);
      throw err;
    }

    const delay = retryDelayMs * Math.pow(backoffFactor, attempt);
    console.warn(
      `[API] retry ${attempt + 1}/${retries} en ${delay}ms -> ${method} ${toURL(path)}`,
    )

    attempt++;;
    await sleep(delay);
// continuar al siguiente intento
  } finally {
    clearTimeout(t);
  }
}
}

// ---- Helpers específicos ----
export function postJSON(path, data, timeoutMs = 12000) {
  return request('POST', path, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    timeoutMs,
    responseType: 'json',
  });
}

export function postForm(path, formData, timeoutMs = 120000) { // ↑ más tiempo por generación de PDF/preview
  return request('POST', path, {
    body: formData, // el browser setea multipart/form-data
    timeoutMs,
    responseType: 'json',
  });
}

export function postFormBlob(path, formData, timeoutMs = 120000) {
  return request('POST', path, {
    body: formData,
    timeoutMs,
    responseType: 'blob',
  });
}

export function getJSON(path, timeoutMs = 12000) {
  return request('GET', path, { timeoutMs, responseType: 'json' });
}