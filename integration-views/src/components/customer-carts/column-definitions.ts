import { TColumn } from '@commercetools-uikit/data-table';
import memoize from 'memoize-one';

export const createVisibleColumnDefinitions = memoize(
  (): Array<TColumn> => [
    { key: 'cartState', label: 'State', isSortable: true },
    { key: 'count', label: 'Line Item count' },
    { key: 'totalPrice', label: 'Total price' },
    {
      key: 'billingAddress',
      label: 'Billing address',
    },
  ]
);
