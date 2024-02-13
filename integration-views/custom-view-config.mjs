/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomView}
 */
const config = {
  name: 'Order Tracker',
  cloudIdentifier: 'gcp-eu',
  env: {
    development: {
      initialProjectKey: 'tech-sales-fashion-store',
      // hostUriPath: '/tech-sales-fashion-store/orders/6a6e41cb-3b2d-4a8a-9512-210c7e24c6ba/general'
      hostUriPath: '/tech-sales-fashion-store/customers/d4245e5d-a986-4307-ac9a-df2246736d3a/general'
    },
    production: {
      customViewId: 'TODO',
      url: 'https://my-custom-view.com',
    },
  },
  headers: {
    csp: {
      'connect-src': [
        'https://www.google.com/',
      ],
      'frame-src': [
        'https://www.google.com/',
      ],
    }
  },
  oAuthScopes: {
    view: ['view_orders', 'view_customers'],
    manage: [],
  },
  type: 'CustomPanel',
  typeSettings: {
    size: 'LARGE',
  },
  locators: ['products.product_details.general'],
};

export default config;
