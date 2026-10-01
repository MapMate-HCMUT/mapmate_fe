import { apiClient } from '../../../lib/apiClient';

// POST /api/auth/login  -> { token, user }
export const loginApi = ({ email, password }) => apiClient.post('/auth/login', { email, password });

// POST /api/auth/register -> { userId, token, user }
export const registerApi = ({ email, password, username }) => apiClient.post('/auth/register', { email, password, username });
