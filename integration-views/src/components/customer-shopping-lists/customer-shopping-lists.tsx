import { FC } from 'react';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { TColumn } from '@commercetools-uikit/data-table';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { usePaginationState } from '@commercetools-uikit/hooks';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  getErrorMessage,
  useShoppingListsFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { TShoppingList } from '../../types/generated/ctp';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { Switch } from 'react-router';
import CustomerShoppingList from '../customer-shopping-list/customer-shopping-list';
import { PaginatableDataTable } from 'commercetools-demo-shared-paginatable-data-table';
import {
  defaultShoppingListsColumnsDefinition,
  defaultShoppingListsItemRenderer,
} from 'commercetools-demo-shared-cart-handling';
import { useIntl } from 'react-intl';

type Props = { id: string };

export const CustomerShoppingLists: FC<Props> = ({ id }) => {
  const intl = useIntl();
  const paginationState = usePaginationState();
  const { push } = useHistory();
  const match = useRouteMatch();

  const { shoppingLists, loading, error, refetch } = useShoppingListsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
    where: `customer(id="${id}")`,
  });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
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
  if (!shoppingLists) {
    return <PageNotFound />;
  }
  const columns: Array<TColumn<TShoppingList>> = [
    // { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'count', label: 'Line Item count' },
    // { key: 'customer', label: 'Customer' },
  ];

  return (
    <Spacings.Stack scale={'l'}>
      <PaginatableDataTable
        rows={shoppingLists.results}
        visibleColumns={columns}
        columns={defaultShoppingListsColumnsDefinition({ intl })}
        itemRenderer={defaultShoppingListsItemRenderer(
          dataLocale,
          projectLanguages
        )}
        onRowClick={(row) => {
          push(`${match.url}/${row.id}`);
        }}
        paginationState={paginationState}
        totalItems={shoppingLists.total}
      />
      <Switch>
        <SuspendedRoute path={`${match.path}/:id`}>
          <CustomerShoppingList
            onClose={() => {
              refetch();
              push(match.url);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </Spacings.Stack>
  );
};

export default CustomerShoppingLists;
