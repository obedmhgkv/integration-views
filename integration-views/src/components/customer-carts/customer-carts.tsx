import { FC } from 'react';
import {
  getErrorMessage,
  useCartsFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
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
  defaultCartsColumnsDefinition,
  defaultCartsItemRenderer,
} from 'commercetools-demo-shared-cart-handling';
import { createVisibleColumnDefinitions } from './column-definitions';

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

  return (
    <>
      {carts.total === 0 && <div>{intl.formatMessage(messages.noResults)}</div>}
      {carts.total > 0 && (
        <PageContentFull>
          <PaginatableDataTable
            visibleColumns={createVisibleColumnDefinitions()}
            columns={defaultCartsColumnsDefinition({ intl })}
            rows={results}
            itemRenderer={defaultCartsItemRenderer(intl)}
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
