import api from './api';

/**
 * Creates a new cloud connection.
 * @param {Object} payload - { name, accountId, roleArn, region, description }
 */
export const createConnection = (payload) =>
  api.post('/cloud-connections', payload);

/**
 * Lists all cloud connections for the authenticated user.
 */
export const listConnections = () =>
  api.get('/cloud-connections');

/**
 * Gets a single cloud connection by ID.
 * @param {string} id
 */
export const getConnection = (id) =>
  api.get(`/cloud-connections/${id}`);

/**
 * Updates a cloud connection.
 * @param {string} id
 * @param {Object} payload
 */
export const updateConnection = (id, payload) =>
  api.put(`/cloud-connections/${id}`, payload);

/**
 * Deletes a cloud connection by ID.
 * @param {string} id
 */
export const deleteConnection = (id) =>
  api.delete(`/cloud-connections/${id}`);

/**
 * Tests a cloud connection (STS AssumeRole + GetCallerIdentity).
 * @param {string} id
 */
export const testConnection = (id) =>
  api.post(`/cloud-connections/${id}/test`);
