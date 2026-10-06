import type { Booking } from '../api/BookingApi';

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
    return {
        firstname: 'E2E',
        lastname: 'Journey',
        totalprice: 100,
        depositpaid: true,
        bookingdates: {
            checkin: '2026-10-06',
            checkout: '2026-10-07',
        },
        additionalneeds: 'Breakfast',
        ...overrides,
    };
}
