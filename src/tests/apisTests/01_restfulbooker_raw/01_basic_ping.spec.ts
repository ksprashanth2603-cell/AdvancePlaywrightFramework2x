import { test, expect } from '@playwright/test';

const apiBaseUrl = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';

test('ping request - GET', async ({ request }) => {
    const responseData = await request.get(`${apiBaseUrl}/ping`);
    expect(responseData.ok()).toBeTruthy();
    expect(responseData.status()).toBe(201);
});