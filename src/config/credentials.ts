import { envOr } from './env';

/** STANDARD_USER / TTA_SECRET as in AdvancePlaywrightFramework2x; USERNAME / PASSWORD are accepted as the older names. */
export const credentials = {
    standardUser: envOr('STANDARD_USER', envOr('USERNAME', 'standard_user')),
    password: envOr('TTA_SECRET', envOr('PASSWORD', 'tta_secret')),
} as const;