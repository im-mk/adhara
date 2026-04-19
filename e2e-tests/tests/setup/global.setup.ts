import { request, type APIResponse, type FullConfig } from '@playwright/test';
import { env } from '../utils/env.js';

const safeText = async (response: APIResponse): Promise<string> => {
  try {
    return await response.text();
  } catch {
    return '<unreadable response body>';
  }
};

async function maybeBootstrapUser() {
  if (!env.bootstrap) {
    return;
  }

  const client = await request.newContext({ baseURL: env.userServiceUrl });
  try {
    const response = await client.post('/bootstrap', {
      data: {
        username: env.username,
        email: env.email,
        password: env.password,
        first_name: env.firstName,
        last_name: env.lastName,
      },
    });

    if (response.ok()) {
      return;
    }

    const body = await safeText(response);
    const lower = body.toLowerCase();
    const alreadyBootstrapped = lower.includes('bootstrap') || lower.includes('exists');

    if (!alreadyBootstrapped) {
      throw new Error(`Unexpected /bootstrap response: ${response.status()} ${body}`);
    }
  } finally {
    await client.dispose();
  }
}

async function assertLoginWorks() {
  const client = await request.newContext({ baseURL: env.appApiUrl });
  try {
    const response = await client.post('/login', {
      data: {
        username: env.username,
        password: env.password,
      },
    });

    if (!response.ok()) {
      const body = await safeText(response);
      throw new Error(
        `E2E login failed (${response.status()}). Check E2E credentials in .env.e2e and stack readiness. Response: ${body}`,
      );
    }
  } finally {
    await client.dispose();
  }
}

export default async function globalSetup(_config: FullConfig) {
  await maybeBootstrapUser();
  await assertLoginWorks();
}
