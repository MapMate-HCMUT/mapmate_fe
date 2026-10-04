import { apiClient } from '../../../lib/apiClient';

// POST /api/auth/login  -> { token, user }
export const loginApi = ({ email, password }) => apiClient.post('/auth/login', { email, password });

// POST /api/auth/register -> { userId, token, user }
export const registerApi = ({ email, password, username }) => apiClient.post('/auth/register', { email, password, username });

// POST /api/auth/google -> { token, user }
export const googleLoginApi = (payload) => apiClient.post('/auth/google', payload);
