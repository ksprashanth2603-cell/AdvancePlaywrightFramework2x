import { expect, test } from '@playwright/test';
import { envOr } from '@config/env';
import { ApiHelper } from '@utils/ApiHelper';
import {
    bookingPayloadValidationErrors,
    generateBookingData,
    validateBookingPayload,
    type BookingPayload,
} from '../../ai/agents/testDataGenerator';

interface CreateBookingResponse {
    bookingid: number;
    booking: BookingPayload;
}

const fallbackPayload: BookingPayload = {
    firstname: 'Morgan',
    lastname: 'Taylor',
    totalprice: 584,
    depositpaid: true,
    bookingdates: { checkin: '2027-03-12', checkout: '2027-03-16' },
    additionalneeds: 'Late checkout',
};
const apiBaseUrl = envOr('API_BASE_URL', 'https://restful-booker.herokuapp.com');

test('AI-generated booking payload validates and is accepted by POST /booking', async ({ request }, testInfo) => {
    const agentResult = await generateBookingData({ scenario: 'a four-night leisure stay' });
    const payload = agentResult.status === 'available' ? agentResult.data : fallbackPayload;

    expect(validateBookingPayload(payload), bookingPayloadValidationErrors()).toBe(true);
    await testInfo.attach('ai-data', {
        body: JSON.stringify(payload, null, 2),
        contentType: 'application/json',
    });

    const api = new ApiHelper(request);
    const response = await api.post(`${apiBaseUrl}/booking`, payload);
    expect(response.status()).toBe(200);

    const body = await api.parseJsonResponse<CreateBookingResponse>(response);
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking).toEqual(payload);
});