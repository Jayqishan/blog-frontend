import { apiRequest } from './api';

export function fetchPosts({ page = 1, limit = 6, search = '' } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  return apiRequest(`/posts?${params.toString()}`);
}

export function fetchPostById(id) {
  return apiRequest(`/posts/${id}`);
}

export function fetchMyPosts() {
  return apiRequest('/posts/mine');
}

export function createPost(payload) {
  return apiRequest('/posts/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePost(id, payload) {
  return apiRequest(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePost(id) {
  return apiRequest(`/posts/${id}`, {
    method: 'DELETE',
  });
}

export function likePost(postId) {
  return apiRequest('/likes/like', {
    method: 'POST',
    body: JSON.stringify({ post: postId }),
  });
}

export function unlikePost(postId) {
  return apiRequest('/likes/unlike', {
    method: 'POST',
    body: JSON.stringify({ post: postId }),
  });
}

export function createComment(payload) {
  return apiRequest('/comments/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sharePost(postId) {
  return apiRequest('/shares/create', {
    method: 'POST',
    body: JSON.stringify({ post: postId }),
  });
}
