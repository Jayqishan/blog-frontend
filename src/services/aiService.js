import { apiRequest } from './api';

async function requestAi(feature, payload) {
  const data = await apiRequest('/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ feature, ...payload }),
  });

  return data.result || '';
}

export async function generateTitle(body) {
  return requestAi('title', { body });
}

export async function suggestContent(titleOrTopic) {
  return requestAi('ideas', { titleOrTopic });
}

export async function generateSummary(body) {
  return requestAi('summary', { body });
}

export async function generateTags(title, body) {
  return requestAi('tags', { title, body });
}
