// src/helpers/api.js

const getBaseURL = () => {
  const env = import.meta.env.VITE_API_URL
  if (env) return env.replace(/\/$/, '')

  const { protocol, hostname } = window.location
  const proto = protocol === 'https:' ? 'https' : 'http'

  const guessed =
    hostname === 'localhost' || hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : `${proto}://${hostname}:8000`

  return guessed.replace(/\/$/, '')
}

export const BASE_URL = getBaseURL()

export const toURL = (path) => {
  const base = getBaseURL()
  if (!path) return base
  return path.startsWith('http')
    ? path
    : `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export const toAbsoluteURL = (u) => (u?.startsWith('http') ? u : toURL(u))

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request(
  method,
  path,
  {
    headers = {},
    body,
    timeoutMs = 12000,
    responseType = 'json',
    retries = 3,
    retryDelayMs = 300,
    backoffFactor = 1.3,
  } = {}
) {
  let attempt = 0

  while (true) {
    const ctrl = new AbortController()
    const timeoutId = setTimeout(() => ctrl.abort(), timeoutMs)

    try {
      const res = await fetch(toURL(path), {
        method,
        headers,
        body,
        signal: ctrl.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const err = new Error(`Error ${res.status}: ${text || res.statusText}`)
        err.status = res.status
        throw err
      }

      if (responseType === 'blob') return await res.blob()
      if (responseType === 'text') return await res.text()
      return await res.json()
    } catch (err) {
      let normalizedError = err

      if (err.name === 'AbortError') {
        normalizedError = new Error('La solicitud tardó demasiado (timeout).')
        normalizedError.isTimeout = true
      }

      const status = normalizedError.status
      const isTimeout = normalizedError.isTimeout === true
      const isNetworkError = normalizedError.name === 'TypeError'
      const isServerError =
        typeof status === 'number' && status >= 500 && status < 600

      const shouldRetry =
        attempt < retries && (isTimeout || isNetworkError || isServerError)

      if (!shouldRetry) {
        console.error(`[API] ${method} ${toURL(path)} →`, normalizedError)
        throw normalizedError
      }

      const delay = Math.round(retryDelayMs * Math.pow(backoffFactor, attempt))

      console.warn(
        `[API] retry ${attempt + 1}/${retries} en ${delay}ms -> ${method} ${toURL(path)}`
      )

      attempt++
      await sleep(delay)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export function postJSON(path, data, timeoutMs = 12000) {
  return request('POST', path, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    timeoutMs,
    responseType: 'json',
  })
}

export function postForm(path, formData, timeoutMs = 120000) {
  return request('POST', path, {
    body: formData,
    timeoutMs,
    responseType: 'json',
  })
}

export function postFormBlob(path, formData, timeoutMs = 120000) {
  return request('POST', path, {
    body: formData,
    timeoutMs,
    responseType: 'blob',
  })
}

export function getJSON(path, timeoutMs = 12000) {
  return request('GET', path, {
    timeoutMs,
    responseType: 'json',
  })
}