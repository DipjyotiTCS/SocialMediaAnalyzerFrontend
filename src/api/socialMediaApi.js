const DEFAULT_API_BASE_PATH = '/api';

export function getConfiguredBackendBaseUrl() {
  return (import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
}

export function getConfiguredApiBasePath() {
  return (import.meta.env.VITE_API_BASE_PATH || DEFAULT_API_BASE_PATH).replace(/\/$/, '');
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function getErrorMessage(responseBody) {
  return typeof responseBody === 'string'
    ? responseBody
    : responseBody?.detail || responseBody?.message || JSON.stringify(responseBody);
}

export async function analyzeSocialPost(payload) {
  const apiBasePath = getConfiguredApiBasePath();
  const response = await fetch(`${apiBasePath}/social/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await parseResponse(response);

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${getErrorMessage(responseBody)}`);
  }

  return responseBody;
}

export async function fetchRecentSocialPosts(limit = 15) {
  const apiBasePath = getConfiguredApiBasePath();
  const response = await fetch(`${apiBasePath}/social/posts?limit=${encodeURIComponent(limit)}`);
  const responseBody = await parseResponse(response);

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${getErrorMessage(responseBody)}`);
  }

  return responseBody;
}

export async function createSocialPost(payload) {
  const apiBasePath = getConfiguredApiBasePath();
  const response = await fetch(`${apiBasePath}/social/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await parseResponse(response);

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}: ${getErrorMessage(responseBody)}`);
  }

  return responseBody;
}
