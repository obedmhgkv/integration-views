import { lazy } from 'react';

const Orders = lazy(() => import('./orders' /* webpackChunkName: "orders" */));

export default Orders;
