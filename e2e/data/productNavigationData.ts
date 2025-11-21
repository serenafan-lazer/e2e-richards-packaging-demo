/**
 * Test data for Product Navigation E2E tests
 * Contains constants for collections, products, and test URLs
 */

/**
 * Glass Bottles & Jars collection data
 */
export const GLASS_BOTTLES_JARS_COLLECTION = {
  url: '/collections/glass-bottles-jars-1',
  name: 'Glass Bottles & Jars',
  productCount: 39,
};

/**
 * Target product data for navigation tests
 * Product: 12 OZ FLT 70G/450 MAYONNAISE RP-1014 (6)
 */
export const TARGET_PRODUCT = {
  name: '12 OZ FLT 70G/450 MAYONNAISE RP-1014 (6)',
  sku: '40220148',
  url: '/products/12-oz-flt-70g-450-mayo-rp-1014-6',
  specifications: {
    capacity: '12 OZ',
    material: 'Glass',
    color: 'Clear Flint',
    countryOfOrigin: 'China',
  },
};

/**
 * Sort options available on collection pages
 */
export const SORT_OPTIONS = {
  titleAscending: 'title-ascending',
};
