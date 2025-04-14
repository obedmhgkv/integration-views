import { FC } from 'react';
import { useCartsFetcher } from 'commercetools-demo-shared-data-fetching-hooks';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { formatAddress, formatMoney, getErrorMessage } from '../../helpers';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  PageContentFull,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import messages from './messages';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { Switch, useHistory, useRouteMatch } from 'react-router';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CustomerCart from '../customer-cart/customer-cart';
import { PaginatableDataTable } from 'commercetools-demo-shared-paginatable-data-table';
import {
  createHiddenColumnDefinitions,
  createVisibleColumnDefinitions,
} from './column-definitions';
import { TCart } from '../../types/generated/ctp';
import { TColumn } from '@commercetools-uikit/data-table';
import { TTone } from '@commercetools-uikit/stamp/dist/declarations/src/stamp';
import Stamp from '@commercetools-uikit/stamp';

type Props = { id: string };

export const CustomerCarts: FC<Props> = ({ id }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();

  const tableSorting = useDataTableSortingState({
    key: 'createdAt',
    order: 'desc',
  });
  const { dataLocale } = useCustomViewContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const paginationState = usePaginationState();
  const { carts, loading, error, refetch } = useCartsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    where: `customerId="${id}"`,
    locale: dataLocale,
  });

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!carts || !carts.results) {
    return <PageNotFound />;
  }

  const { results } = carts;

  const itemRenderer = (item: TCart, column: TColumn<TCart>) => {
    switch (column.key) {
      case 'createdAt':
        return intl.formatDate(item.createdAt);
      case 'lastModifiedAt':
        return intl.formatDate(item.lastModifiedAt);
      case 'cartState': {
        let tone: TTone = 'primary';
        switch (item.cartState) {
          case 'Active':
            tone = 'primary';
            break;
          case 'Merged':
            tone = 'secondary';
            break;
          case 'Ordered':
            tone = 'information';
            break;
          case 'Frozen':
            tone = 'warning';
            break;
        }
        return <Stamp tone={tone} label={item.cartState} isCondensed={true} />;
      }
      case 'count':
        return item.lineItems?.reduce((a, c) => a + c.quantity, 0);
      case 'totalPrice':
        return formatMoney(item.totalPrice, intl);
      case 'shippingAddress':
        return formatAddress(item.shippingAddress);
      case 'billingAddress':
        return formatAddress(item.billingAddress);
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any)[column.key] || '';
    }
  };

  return (
    <>
      {carts.total === 0 && <div>{intl.formatMessage(messages.noResults)}</div>}
      {carts.total > 0 && (
        <PageContentFull>
          <PaginatableDataTable
            visibleColumns={createVisibleColumnDefinitions()}
            columns={createHiddenColumnDefinitions(intl.formatMessage)}
            rows={results}
            itemRenderer={itemRenderer}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
            paginationState={paginationState}
            totalItems={carts.total}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
          />
        </PageContentFull>
      )}
      <Switch>
        <SuspendedRoute path={`${match.path}/:id`}>
          <CustomerCart
            onClose={async () => {
              await refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </>
  );
};

export default CustomerCarts;
