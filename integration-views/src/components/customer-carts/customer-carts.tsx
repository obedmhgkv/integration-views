import { FC, useState } from 'react';
import { useCartsFetcher } from '../../hooks/use-carts-hook';
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
import {
  createHiddenColumnDefinitions,
  createVisibleColumnDefinitions,
} from './column-definitions';
import { TCart } from '../../types/generated/ctp';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import { useIntl } from 'react-intl';
import { Pagination } from '@commercetools-uikit/pagination';
import messages from './messages';
import { useHistory, useRouteMatch } from 'react-router';
import Stamp from '@commercetools-uikit/stamp';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { TTone } from '@commercetools-uikit/stamp/dist/declarations/src/stamp';

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
  const { page, perPage } = usePaginationState();
  const { carts, loading, error } = useCartsFetcher({
    limit: perPage.value,
    offset: (page.value - 1) * perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    where: `customerId="${id}"`,
    locale: dataLocale,
  });

  const [tableData, setTableData] = useState({
    columns: [
      ...createVisibleColumnDefinitions(),
      ...createHiddenColumnDefinitions(intl.formatMessage),
    ],
    visibleColumns: createVisibleColumnDefinitions(),
    visibleColumnKeys: createVisibleColumnDefinitions().map(
      (column) => column.key
    ),
  });

  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);

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

  const columnManager = {
    disableColumnManager: false,
    hideableColumns: tableData.columns,
    visibleColumnKeys: tableData.visibleColumnKeys,
  };
  const onSettingChange = (action: string, nextValue: boolean | string[]) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue as boolean);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue as boolean);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              visibleColumns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
    }
  };

  const { results } = carts;
  return (
    <>
      {carts.total === 0 && <div>{intl.formatMessage(messages.noResults)}</div>}
      {carts.total > 0 && (
        <PageContentFull>
          <Spacings.Stack scale="m">
            <DataTableManager
              columns={tableData.visibleColumns}
              columnManager={columnManager}
              onSettingsChange={onSettingChange}
              displaySettings={{
                isWrappingText,
                isCondensed,
                disableDisplaySettings: false,
              }}
            >
              <DataTable
                isCondensed
                columns={tableData.visibleColumns}
                rows={results}
                itemRenderer={itemRenderer}
                sortedBy={tableSorting.value.key}
                sortDirection={tableSorting.value.order}
                onSortChange={tableSorting.onChange}
                onRowClick={(row) => push(`${match.url}/${row.id}`)}
              />
            </DataTableManager>
            <Pagination
              page={page.value}
              onPageChange={page.onChange}
              perPage={perPage.value}
              onPerPageChange={perPage.onChange}
              totalItems={carts.total}
            />
          </Spacings.Stack>
        </PageContentFull>
      )}
    </>
  );
};

export default CustomerCarts;
