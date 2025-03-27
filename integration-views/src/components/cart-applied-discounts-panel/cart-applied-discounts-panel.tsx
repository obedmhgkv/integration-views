import { FC } from 'react';
import { useIntl } from 'react-intl';
import messages from './messages';

import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Constraints from '@commercetools-uikit/constraints';
import Spacings from '@commercetools-uikit/spacings';
import {
  TBaseMoney,
  TCart,
  TDirectDiscountDraft,
} from '../../types/generated/ctp';
import CartCartDiscounts from '../cart-cart-discounts/cart-cart-discounts';
import CartDiscountCodes from '../cart-discount-codes/cart-discount-codes';
import CartDiscount from '../cart-discount';

export const MISSING_DISCOUNT_CODE = 'missingDiscountCode';
export const OUTDATED_DISCOUNT_CODE = 'outdatedDiscountCode';

export interface Discount {
  id: string;
  name: Record<string, string>;
  amount: TBaseMoney;
  discountCodes: string[];
}
export interface Error {
  code?: string;
  extensions?: {
    code?: string;
  };
}

interface Props {
  onApplyDiscountCode: (code: string) => Promise<void>;
  onRemoveDiscountCode: (id: string) => void;
  onApplyDirectDiscount: (
    directDiscounts: Array<TDirectDiscountDraft>
  ) => Promise<void>;
  cart: TCart;
  resetErrors?: (...args: unknown[]) => unknown;
  errors?: Array<Error>;
}

const CartAppliedDiscountsPanel: FC<Props> = ({
  cart,
  errors,
  onRemoveDiscountCode,
  onApplyDiscountCode,
  onApplyDirectDiscount,
  resetErrors,
}) => {
  const intl = useIntl();

  return (
    <CollapsiblePanel
      condensed
      header={intl.formatMessage(messages.title)}
      theme="light"
    >
      <Constraints.Horizontal>
        <Spacings.Inset scale="s">
          <Spacings.Stack scale="m">
            <CartCartDiscounts cart={cart} />
            <CartDiscountCodes
              cart={cart}
              onApplyDiscountCode={onApplyDiscountCode}
              onRemoveDiscountCode={onRemoveDiscountCode}
              errors={errors}
              resetErrors={resetErrors}
            />
            <CartDiscount
              cart={cart}
              onApplyDirectDiscount={onApplyDirectDiscount}
            />
          </Spacings.Stack>
        </Spacings.Inset>
      </Constraints.Horizontal>
    </CollapsiblePanel>
  );
};

CartAppliedDiscountsPanel.displayName = 'CartAppliedDiscountsPanel';
export default CartAppliedDiscountsPanel;
