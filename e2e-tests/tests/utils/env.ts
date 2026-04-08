export type E2ECredentials = {
  username: string;
  password: string;
};

export const env = {
  baseUrl: process.env.E2E_BASE_URL ?? 'http://localhost:8090',
  appApiUrl: process.env.E2E_APP_API_URL ?? 'http://localhost:8020',
  userServiceUrl: process.env.E2E_USER_SERVICE_URL ?? 'http://localhost:8040',
  username: process.env.E2E_USERNAME ?? 'user',
  password: process.env.E2E_PASSWORD ?? 'password',
  email: process.env.E2E_EMAIL ?? 'e2e_admin@example.com',
  firstName: process.env.E2E_FIRST_NAME ?? 'E2E',
  lastName: process.env.E2E_LAST_NAME ?? 'Admin',
  bootstrap: (process.env.E2E_BOOTSTRAP ?? 'true').toLowerCase() === 'true',
};

export const credentials: E2ECredentials = {
  username: env.username,
  password: env.password,
};
