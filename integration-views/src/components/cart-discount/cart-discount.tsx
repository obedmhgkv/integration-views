import { FC } from 'react';
import { useFormik } from 'formik';
import { ErrorMessage } from '@commercetools-uikit/messages';
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
import { TMoneyFieldProps } from '@commercetools-uikit/money-field/dist/declarations/src/money-field';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { BinFilledIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import IconButton from '@commercetools-uikit/icon-button';
import { formatMoney, formatPercentage } from '../../helpers';
import {
  cartDiscountValueInputFromFormikValues,
  fromDirectDiscountToDirectDiscountDraft,
  validate,
} from './conversion';
import Stamp from '@commercetools-uikit/stamp';
import { TTone } from '@commercetools-uikit/stamp/dist/declarations/src/stamp';

export const DISCOUNT_TARGET_TYPES = {
  SHIPPING: 'shipping',
  TOTAL_PRICE: 'totalPrice',
};

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

const getTargetTypeOptions = memoize((intl) => {
  return [
    {
      label: intl.formatMessage(messages.cartDiscountOnShipping),
      value: DISCOUNT_TARGET_TYPES.SHIPPING,
    },
    {
      label: intl.formatMessage(messages.cartDiscountOnCartTotalPrice),
      value: DISCOUNT_TARGET_TYPES.TOTAL_PRICE,
    },
  ];
});

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

interface Props {
  cart: TCart;
  onApplyDirectDiscount: (
    directDiscounts: Array<TDirectDiscountDraft>
  ) => Promise<void>;
}

export type FormikType = {
  discountType: string;
  discountValueAbsolute: { amount: string; currencyCode: string };
  discountValueRelative: string;
  targetType: string;
};

const CartDiscount: FC<Props> = ({ cart, onApplyDirectDiscount }) => {
  const intl = useIntl();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const formik = useFormik<FormikType>({
    initialValues: {
      discountType: DISCOUNT_SELECT_TYPES.RELATIVE,
      discountValueAbsolute: {
        currencyCode: cart.totalPrice.currencyCode,
        amount: '',
      },
      discountValueRelative: '',
      targetType: DISCOUNT_TARGET_TYPES.TOTAL_PRICE,
    },
    onSubmit: async (values) => {
      await onApplyDirectDiscount(
        fromDirectDiscountToDirectDiscountDraft(cart.directDiscounts).concat([
          cartDiscountValueInputFromFormikValues(values),
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
        let targetTypeLabel = discountCode.target?.type;
        switch (discountCode.target?.type) {
          case DISCOUNT_TARGET_TYPES.TOTAL_PRICE:
            targetTypeLabel = intl.formatMessage(
              messages.cartDiscountOnCartTotalPrice
            );
            break;
          case DISCOUNT_TARGET_TYPES.SHIPPING:
            targetTypeLabel = intl.formatMessage(
              messages.cartDiscountOnShipping
            );
            break;
        }
        return targetTypeLabel;
      case 'type':
        let typeTone: TTone = 'primary';
        let typeLabel = discountCode.value?.type;
        switch (discountCode.value?.type) {
          case DISCOUNT_SELECT_TYPES.RELATIVE:
            typeTone = 'primary';
            typeLabel = intl.formatMessage(messages.relativeCartDiscountOption);
            break;
          case DISCOUNT_SELECT_TYPES.ABSOLUTE:
            typeTone = 'secondary';
            typeLabel = intl.formatMessage(messages.absoluteCartDiscountOption);
            break;
          // case 'Ordered':
          //   typeTone = 'information';
          //   break;
          // case 'Frozen':
          //   typeTone = 'warning';
          //   break;
        }
        return <Stamp tone={typeTone} label={typeLabel} isCondensed={true} />;
      case 'value': {
        switch (discountCode.value.type) {
          case 'relative': {
            const relative = discountCode.value as TRelativeDiscountValue;
            return formatPercentage(relative.permyriad / 100);
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
          name="targetType"
          onChange={formik.handleChange}
          options={getTargetTypeOptions(intl)}
          value={formik.values.targetType}
          horizontalConstraint={6}
        />
        <SelectField
          title={''}
          isDisabled={!canManage}
          name="discountType"
          onChange={formik.handleChange}
          options={getOptions(intl)}
          value={formik.values.discountType}
          horizontalConstraint={6}
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
            renderError={(key: string) => {
              switch (key) {
                case 'cartDiscountOutOfBoundaries': {
                  return (
                    <ErrorMessage>
                      {intl.formatMessage(messages.cartDiscountOutOfBoundaries)}
                    </ErrorMessage>
                  );
                }
                case 'cartDiscountTooPrecise': {
                  return (
                    <ErrorMessage>
                      {intl.formatMessage(messages.cartDiscountTooPrecise)}
                    </ErrorMessage>
                  );
                }
                case 'missing': {
                  return (
                    <ErrorMessage>
                      {intl.formatMessage(messages.missing)}
                    </ErrorMessage>
                  );
                }
              }
              return <ErrorMessage>{key}</ErrorMessage>;
            }}
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
