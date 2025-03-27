import { defineMessages } from 'react-intl';

export default defineMessages({
  applyButton: {
    id: 'Orders.quotes.draft.discounts.applyButton',
    description: 'Title of "Apply" button',
    defaultMessage: 'Apply',
  },
  noneCartDiscountOption: {
    id: 'Orders.quotes.draft.discounts.noneCartDiscountOption',
    description: 'Select dropdown option for applying cart discount',
    defaultMessage: 'none',
  },
  relativeCartDiscountOption: {
    id: 'Orders.quotes.draft.discounts.relativeCartDiscountOption',
    description: 'Select dropdown option for applying cart discount',
    defaultMessage: 'Relative (%)',
  },
  absoluteCartDiscountOption: {
    id: 'Orders.quotes.draft.discounts.absoluteCartDiscountOption',
    description: 'Select dropdown option for applying cart discount',
    defaultMessage: 'Absolute',
  },
  applyDiscountText: {
    id: 'Orders.quotes.draft.discounts.applyDiscountText',
    description: 'A call to action text next to select input',
    defaultMessage: 'Apply Direct Discount',
  },
  removeDirectDiscountLabel: {
    id: 'Orders.Create.Step.LineItems.AppliedDiscounts.removeDirectDiscountLabel',
    defaultMessage: 'Remove direct discount',
  },
  type: {
    id: 'Orders.Create.Step.LineItems.AppliedDiscounts.type',
    defaultMessage: 'Direct Discount Type',
  },
  value: {
    id: 'Orders.Create.Step.LineItems.AppliedDiscounts.value',
    defaultMessage: 'Value',
  },
  targetType: {
    id: 'Orders.Create.Step.LineItems.AppliedDiscounts.targetType',
    defaultMessage: 'Target Type',
  },
  missing: {
    id: 'Orders.Create.Step.LineItems.AppliedDiscounts.missing',
    defaultMessage: 'This field is required. Provide a value.',
  },
  cartDiscountOutOfBoundaries: {
    id: 'Orders.quotes.draft.discounts.relativeCartDiscountOutOfBoundaries',
    description: 'Error message on discount value field',
    defaultMessage:
      'Relative discount value must be a number between 0 and 100',
  },
  cartDiscountTooPrecise: {
    id: 'Orders.quotes.draft.discounts.relativeCartDiscountTooPrecise',
    description: 'Error message on discount value field',
    defaultMessage:
      'Relative discount value must be a number with max. 2 fraction digits',
  },
  cartDiscountOnCartTotalPrice: {
    id: 'Orders.quotes.draft.discounts.cartDiscountOnCartTotalPrice',
    defaultMessage: 'Discount on Cart total price',
  },
  cartDiscountOnShipping: {
    id: 'Orders.quotes.draft.discounts.cartDiscountOnShipping',
    defaultMessage: 'Discount on Shipping',
  },
});
