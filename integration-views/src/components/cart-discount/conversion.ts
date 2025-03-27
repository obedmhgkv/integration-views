import {
  TAbsoluteDiscountValue,
  TCartDiscountValueInput,
  TDirectDiscount,
  TDirectDiscountDraft,
  TRelativeDiscountValue,
} from '../../types/generated/ctp';
import { FormikType } from './cart-discount';

export const fromDirectDiscountToDirectDiscountDraft = (
  directDiscounts: Array<TDirectDiscount>
): Array<TDirectDiscountDraft> => {
  return directDiscounts.map((directDiscount) => {
    let cartDiscountValueInput: TCartDiscountValueInput = {};
    if (directDiscount.value.type === 'absolute') {
      const value = directDiscount.value as TAbsoluteDiscountValue;
      cartDiscountValueInput = {
        absolute: {
          money: value.money.map((money) => ({
            currencyCode: money.currencyCode,
            centAmount: money.centAmount,
          })),
        },
      };
    } else if (directDiscount.value.type === 'relative') {
      const value = directDiscount.value as TRelativeDiscountValue;
      cartDiscountValueInput = {
        relative: {
          permyriad: value.permyriad,
        },
      };
    }

    return {
      target: { totalPrice: { dummy: 'true' } },
      value: cartDiscountValueInput,
    };
  });
};

export const cartDiscountValueInputFromFormikValues = (values: FormikType) => {
  let cartDiscountValueInput: TCartDiscountValueInput = {};
  if (values.discountType === 'absolute') {
    cartDiscountValueInput = {
      absolute: {
        money: [
          {
            centAmount: Math.round(
              Number.parseInt(values.discountValueAbsolute.amount, 10) * 100
            ),
            currencyCode: values.discountValueAbsolute.currencyCode,
          },
        ],
      },
    };
  } else if (values.discountType === 'relative') {
    cartDiscountValueInput = {
      relative: {
        permyriad: Number.parseInt(values.discountValueRelative, 10),
      },
    };
  }
  return cartDiscountValueInput;
};
