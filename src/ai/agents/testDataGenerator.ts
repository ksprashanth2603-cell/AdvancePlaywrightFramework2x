import Ajv, { type AnySchema } from 'ajv';
import { createAgent } from '../agentFactory';

export interface BookingPayload {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: {
        checkin: string; 
        checkout: string;
    };
    additionalneeds?: string;
}

const bookingSchema = require('../../testdata/schemas/create-booking.schema.json') as AnySchema;
const bookingAjv = new Ajv({ allErrors: true });
const validate = bookingAjv.compile<BookingPayload>(bookingSchema);

export const generateBookingData = createAgent<{ scenario: string }, BookingPayload>({
    name: 'test-data-generator',
    prompt: ({ scenario }) => [
        'Create one realistic, entirely synthetic booking payload for the restful-booker API.',
        `Scenario: ${scenario}`,
        'Use ISO dates in YYYY-MM-DD format, with checkout after checkin.',
        'Return exactly one JSON object with firstname, lastname, totalprice, depositpaid, bookingdates, and optional additionalneeds.',
    ].join('\n'),
    schema: bookingSchema,
});

export function validateBookingPayload(value: unknown): value is BookingPayload {
    return validate(value) === true;
}

export function bookingPayloadValidationErrors(): string {
    return bookingAjv.errorsText(validate.errors);
}