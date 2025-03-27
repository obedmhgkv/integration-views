import { FC } from 'react';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import {
  selectDiscounts,
  selectDiscountsOnTotalPrice,
  selectShippingDiscounts,
} from '../../utils/cart-selectors';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { formatMoney } from '../../helpers';
import { Discount } from '../cart-applied-discounts-panel/cart-applied-discounts-panel';
import { TCart } from '../../types/generated/ctp';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIntl } from 'react-intl';
import memoize from 'memoize-one';

const createAppliedDiscountsColumnsDefinition = memoize(
  (intl): Array<TColumn> => [
    {
      key: 'name',
      label: intl.formatMessage(messages.discountName),
    },
    {
      key: 'amount',
      label: intl.formatMessage(messages.amount),
      align: 'right',
    },
    {
      key: 'discountCodes',
      label: intl.formatMessage(messages.discountCodes),
    },
  ]
);

export type Props = { cart: TCart };

const CartCartDiscounts: FC<Props> = ({ cart }) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const discounts = [
    ...selectDiscounts(cart),
    ...selectShippingDiscounts(cart),
    ...selectDiscountsOnTotalPrice(cart),
  ];

  const renderDiscountItem = (
    discount: Discount,
    column: TColumn<Discount>
  ) => {
    switch (column.key) {
      case 'name':
        return formatLocalizedString(
          { name: discount.name },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
      case 'amount':
        return formatMoney(discount.amount, intl, {
          minimumFractionDigits: undefined,
        });
      case 'discountCodes':
        return discount.discountCodes.length === 0
          ? NO_VALUE_FALLBACK
          : discount.discountCodes.join(', ');
      default:
        return undefined;
    }
  };
  return (
    <>
      {discounts.length > 0 ? (
        <DataTable
          columns={createAppliedDiscountsColumnsDefinition(intl)}
          itemRenderer={renderDiscountItem}
          rows={discounts}
        />
      ) : (
        <Text.Detail intlMessage={messages.noDiscounts} fontWeight={'bold'} />
      )}
    </>
  );
};

export default CartCartDiscounts;
