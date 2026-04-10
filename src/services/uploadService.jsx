import { apiRequest } from './api';

export async function uploadImage(file) {
  if (!file) return '';
  const form = new FormData();
  form.append('image', file);
  const data = await apiRequest('/uploads/image', {
    method: 'POST',
    body: form,
  });
  return data.imageUrl;
}
