import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

export const TEST_THEME_ID = process.env['TEST_THEME_ID'] || '';
export const TEST_URL = process.env['TEST_URL'] || 'https://xeghk0-nw.myshopify.com';
export const STORE_PASSWORD = process.env['STORE_PASSWORD'] || 'yahcro';
export const PREVIEW_URL = process.env['PREVIEW_URL'] || TEST_URL + '?preview_theme_id=' + TEST_THEME_ID;