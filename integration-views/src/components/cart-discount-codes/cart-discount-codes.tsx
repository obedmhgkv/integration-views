import { FC, useMemo } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import CartAddDiscountCode from '../cart-add-discount-code';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import {
  MISSING_DISCOUNT_CODE,
  OUTDATED_DISCOUNT_CODE,
  Error,
} from '../cart-applied-discounts-panel/cart-applied-discounts-panel';
import { TCart, TDiscountCode } from '../../types/generated/ctp';
import IconButton from '@commercetools-uikit/icon-button';
import { BinFilledIcon } from '@commercetools-uikit/icons';
import messages from './messages';
import { notEmpty } from '../../helpers';
import { useIntl } from 'react-intl';
import memoize from 'memoize-one';

export type Props = {
  onApplyDiscountCode: (code: string) => Promise<void>;
  onRemoveDiscountCode: (id: string) => void;
  cart: TCart;
  resetErrors?: (...args: unknown[]) => unknown;
  errors?: Array<Error>;
};

const createDiscountCodesColumnsDefinition = memoize((intl) => [
  {
    key: 'code',
    label: intl.formatMessage(messages.code),
  },
  {
    key: 'name',
    label: intl.formatMessage(messages.name),
  },
  {
    key: 'actions',
    label: '',
    width: 'min-content',
  },
]);

const CartDiscountCodes: FC<Props> = ({
  cart,
  errors,
  onRemoveDiscountCode,
  onApplyDiscountCode,
  resetErrors,
}) => {
  const intl = useIntl();
  const renderDiscountCodeItem = (
    discountCode: TDiscountCode,
    column: TColumn<TDiscountCode>
  ) => {
    switch (column.key) {
      case 'name':
        return discountCode.name;
      case 'code':
        return discountCode.code;
      case 'actions':
        return (
          <IconButton
            icon={<BinFilledIcon />}
            label={intl.formatMessage(messages.removeDiscountCodeLabel)}
            onClick={() => onRemoveDiscountCode(discountCode.id)}
            size="medium"
          />
        );
      default:
        return undefined;
    }
  };

  const getErrorByCodes = (codes: Array<string>, errors?: Array<Error>) =>
    errors &&
    errors.find((error) => {
      return (
        error?.extensions?.code ||
        (error.code && codes.includes(error?.extensions?.code ?? error.code))
      );
    });

  const discountCodes = useMemo(
    () =>
      cart.discountCodes
        .map(({ discountCode }) => {
          if (!discountCode) {
            return undefined;
          }
          return {
            ...discountCode,
            id: discountCode?.id || '',
          };
        })
        .filter(notEmpty),
    [cart.discountCodes]
  );
  return (
    <Spacings.Stack>
      <CartAddDiscountCode
        error={getErrorByCodes(
          [MISSING_DISCOUNT_CODE, OUTDATED_DISCOUNT_CODE],
          errors
        )}
        onApplyDiscountCode={onApplyDiscountCode}
        resetErrors={resetErrors}
      />
      {discountCodes.length > 0 && (
        <DataTable
          columns={createDiscountCodesColumnsDefinition(intl)}
          itemRenderer={renderDiscountCodeItem}
          rows={discountCodes}
          verticalCellAlignment="center"
        />
      )}
    </Spacings.Stack>
  );
};

export default CartDiscountCodes;
