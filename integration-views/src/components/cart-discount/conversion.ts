import {
  TAbsoluteDiscountValue,
  TCartDiscountTargetInput,
  TCartDiscountValueInput,
  TDirectDiscount,
  TDirectDiscountDraft,
  TRelativeDiscountValue,
} from '../../types/generated/ctp';
import {
  DISCOUNT_SELECT_TYPES,
  DISCOUNT_TARGET_TYPES,
  FormikType,
} from './cart-discount';
import TextInput from '@commercetools-uikit/text-input';
import omitEmpty from 'omit-empty-es';

type TErrors = {
  discountValueRelative: {
    cartDiscountOutOfBoundaries?: boolean;
    cartDiscountTooPrecise?: boolean;
    missing?: boolean;
  };
  discountValueAbsolute: {
    missing?: boolean;
  };
};

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

    let cartDiscountTargetInput: TCartDiscountTargetInput | undefined =
      undefined;
    if (directDiscount.target?.type === DISCOUNT_TARGET_TYPES.SHIPPING) {
      cartDiscountTargetInput = { shipping: { dummy: 'true' } };
    } else if (
      directDiscount.target?.type === DISCOUNT_TARGET_TYPES.TOTAL_PRICE
    ) {
      cartDiscountTargetInput = { totalPrice: { dummy: 'true' } };
    }

    return {
      target: cartDiscountTargetInput,
      value: cartDiscountValueInput,
    };
  });
};

export const cartDiscountValueInputFromFormikValues = (
  values: FormikType
): TDirectDiscountDraft => {
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
        permyriad: Number.parseInt(values.discountValueRelative, 10) * 100,
      },
    };
  }
  let cartDiscountTargetInput: TCartDiscountTargetInput | undefined = undefined;
  if (values.targetType === DISCOUNT_TARGET_TYPES.SHIPPING) {
    cartDiscountTargetInput = { shipping: { dummy: 'true' } };
  } else if (values.targetType === DISCOUNT_TARGET_TYPES.TOTAL_PRICE) {
    cartDiscountTargetInput = { totalPrice: { dummy: 'true' } };
  }
  return {
    target: cartDiscountTargetInput,
    value: cartDiscountValueInput,
  };
};

export const validate = (values: FormikType) => {
  const errors: TErrors = {
    discountValueRelative: {},
    discountValueAbsolute: {},
  };
  if (values.discountType === DISCOUNT_SELECT_TYPES.RELATIVE) {
    if (
      !values.discountValueRelative ||
      TextInput.isEmpty(String(values.discountValueRelative))
    ) {
      errors.discountValueRelative.missing = true;
    } else {
      const value = parseFloat(values.discountValueRelative);
      if (value < 0 || value > 100) {
        errors.discountValueRelative.cartDiscountOutOfBoundaries = true;
      }
      if (value && parseFloat(value.toFixed?.(2)) !== value) {
        errors.discountValueRelative.cartDiscountTooPrecise = true;
      }
    }
  } else if (values.discountType === DISCOUNT_SELECT_TYPES.ABSOLUTE) {
    if (
      !values.discountValueAbsolute ||
      !values.discountValueAbsolute.currencyCode ||
      !values.discountValueAbsolute.amount ||
      TextInput.isEmpty(String(values.discountValueAbsolute.currencyCode)) ||
      TextInput.isEmpty(String(values.discountValueAbsolute.amount))
    ) {
      errors.discountValueAbsolute.missing = true;
    }
  }
  return omitEmpty<TErrors>(errors);
};
