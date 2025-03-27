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
    defaultMessage: 'relative (%)',
  },
  absoluteCartDiscountOption: {
    id: 'Orders.quotes.draft.discounts.absoluteCartDiscountOption',
    description: 'Select dropdown option for applying cart discount',
    defaultMessage: 'absolute',
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
});
