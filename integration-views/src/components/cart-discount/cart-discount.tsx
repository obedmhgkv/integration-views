import { FC } from 'react';
import { useFormik } from 'formik';
import memoize from 'memoize-one';
import { useIntl } from 'react-intl';
import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';
import NumberField from '@commercetools-uikit/number-field';
import MoneyField from '@commercetools-uikit/money-field';
import {
  TAbsoluteDiscountValue,
  TCart,
  TDirectDiscount,
  TDirectDiscountDraft,
  TRelativeDiscountValue,
} from '../../types/generated/ctp';
import SelectField from '@commercetools-uikit/select-field';
import { PERMISSIONS } from '../../constants';
import omitEmpty from 'omit-empty-es';
import { TMoneyFieldProps } from '@commercetools-uikit/money-field/dist/declarations/src/money-field';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { BinFilledIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import TextInput from '@commercetools-uikit/text-input';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import IconButton from '@commercetools-uikit/icon-button';
import { formatMoney, formatPercentage } from '../../helpers';
import {
  cartDiscountValueInputFromFormikValues,
  fromDirectDiscountToDirectDiscountDraft,
} from './conversion';

export const DISCOUNT_SELECT_TYPES = {
  RELATIVE: 'relative',
  ABSOLUTE: 'absolute',
};

const createDirectDiscountColumnsDefinition = memoize((intl) => [
  {
    key: 'targetType',
    label: intl.formatMessage(messages.targetType),
  },
  {
    key: 'type',
    label: intl.formatMessage(messages.type),
  },
  {
    key: 'value',
    label: intl.formatMessage(messages.value),
  },
  {
    key: 'actions',
    label: '',
    width: 'min-content',
  },
]);

const getOptions = memoize((intl) => {
  return [
    {
      label: intl.formatMessage(messages.relativeCartDiscountOption),
      value: DISCOUNT_SELECT_TYPES.RELATIVE,
    },
    {
      label: intl.formatMessage(messages.absoluteCartDiscountOption),
      value: DISCOUNT_SELECT_TYPES.ABSOLUTE,
    },
  ];
});

interface CartDiscountProps {
  cart: TCart;
  onApplyDirectDiscount: (
    directDiscounts: Array<TDirectDiscountDraft>
  ) => Promise<void>;
}

export type FormikType = {
  discountType: string;
  discountValueAbsolute: { amount: string; currencyCode: string };
  discountValueRelative: string;
};

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

const CartDiscount: FC<CartDiscountProps> = ({
  cart,
  onApplyDirectDiscount,
}) => {
  const intl = useIntl();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const validate = (values: FormikType) => {
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

  const formik = useFormik<FormikType>({
    initialValues: {
      discountType: DISCOUNT_SELECT_TYPES.RELATIVE,
      discountValueAbsolute: {
        currencyCode: cart.totalPrice.currencyCode,
        amount: '',
      },
      discountValueRelative: '',
    },
    onSubmit: async (values) => {
      let cartDiscountValueInput =
        cartDiscountValueInputFromFormikValues(values);

      await onApplyDirectDiscount(
        fromDirectDiscountToDirectDiscountDraft(cart.directDiscounts).concat([
          {
            target: { totalPrice: { dummy: 'true' } },
            value: cartDiscountValueInput,
          },
        ])
      ).then(() => formik.resetForm());
    },
    validate,
    enableReinitialize: true,
  });

  const removeDirectDiscount = async (directDiscountCodeId: string) => {
    const filtered = fromDirectDiscountToDirectDiscountDraft(
      cart.directDiscounts.filter(
        (directDiscount) => directDiscount.id !== directDiscountCodeId
      )
    );
    await onApplyDirectDiscount(filtered);
  };

  const renderDirectDiscount = (
    discountCode: TDirectDiscount,
    column: TColumn<TDirectDiscount>
  ) => {
    switch (column.key) {
      case 'targetType':
        return discountCode.target?.type;
      case 'type':
        return discountCode.value?.type;
      case 'value': {
        switch (discountCode.value.type) {
          case 'relative': {
            const relative = discountCode.value as TRelativeDiscountValue;
            return formatPercentage(relative.permyriad);
          }
          case 'absolute': {
            const absolute = discountCode.value as TAbsoluteDiscountValue;
            return formatMoney(absolute.money[0], intl);
          }
          default:
            console.log('No mapping define');
            return '';
        }
      }
      case 'actions':
        return (
          <IconButton
            icon={<BinFilledIcon />}
            label={intl.formatMessage(messages.removeDirectDiscountLabel)}
            onClick={() => removeDirectDiscount(discountCode.id)}
            size="medium"
          />
        );
      default:
        return undefined;
    }
  };

  return (
    <Spacings.Stack>
      <Spacings.Inline alignItems="flex-end">
        <SelectField
          title={intl.formatMessage(messages.applyDiscountText)}
          isDisabled={!canManage}
          name="discountType"
          onChange={formik.handleChange}
          options={getOptions(intl)}
          value={formik.values.discountType}
          horizontalConstraint={7}
        />
        {formik.values.discountType === DISCOUNT_SELECT_TYPES.RELATIVE && (
          <NumberField
            name="discountValueRelative"
            value={formik.values.discountValueRelative}
            title={''}
            errors={
              NumberField.toFieldErrors<FormikType>(formik.errors)
                .discountValueRelative
            }
            touched={!!formik.touched.discountValueRelative}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isReadOnly={!canManage}
            isDisabled={!canManage || !formik.values.discountType}
            min={0}
            horizontalConstraint={7}
          />
        )}
        {formik.values.discountType === DISCOUNT_SELECT_TYPES.ABSOLUTE && (
          <MoneyField
            name="discountValueAbsolute"
            value={
              formik.values.discountValueAbsolute as TMoneyFieldProps['value']
            }
            title={''}
            errors={
              MoneyField.toFieldErrors<FormikType>(formik.errors)
                .discountValueAbsolute
            }
            touched={{
              amount: !!formik.touched.discountValueAbsolute?.amount,
              currencyCode:
                !!formik.touched.discountValueAbsolute?.currencyCode,
            }}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isReadOnly={!canManage}
            isDisabled={!canManage}
            horizontalConstraint={7}
          />
        )}
        <SecondaryButton
          iconLeft={<PlusBoldIcon />}
          isDisabled={!formik.dirty}
          label={intl.formatMessage(messages.applyButton)}
          onClick={formik.submitForm}
        />
      </Spacings.Inline>
      {cart.directDiscounts.length > 0 && (
        <DataTable
          columns={createDirectDiscountColumnsDefinition(intl)}
          itemRenderer={renderDirectDiscount}
          rows={cart.directDiscounts}
          verticalCellAlignment="center"
        />
      )}
    </Spacings.Stack>
  );
};

CartDiscount.displayName = 'CartDiscount';

export default CartDiscount;
