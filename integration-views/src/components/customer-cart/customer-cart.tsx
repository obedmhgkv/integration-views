import { FC } from 'react';
import {
  CustomFormModalPage,
  PageContentWide,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import {
  getErrorMessage,
  graphQLErrorHandler,
  useCartDeleter,
  useCartFetcher,
  useCartUpdater,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import CartDetailsGeneralInfoHeader from '../cart-details-general-info-header';
import Card from '@commercetools-uikit/card';
import {
  AddressesPanel,
  CartSummaryPricingBreakdown,
  CartDetailsItems,
  CartAppliedDiscountsPanel,
} from 'commercetools-demo-shared-cart-handling';
import {
  TCartState,
  TCartUpdateAction,
  TDirectDiscountDraft,
} from '../../types/generated/ctp';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../constants';

type Props = { onClose: () => Promise<void> };

export const CustomerCart: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const cartUpdater = useCartUpdater();
  const showNotification = useShowNotification();
  const { cart, loading, error, refetch } = useCartFetcher({
    id: id,
    locale: dataLocale,
  });

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const cartDeleter = useCartDeleter();

  const handleDelete = async () => {
    if (cart) {
      await cartDeleter.execute({
        id: cart.id,
        version: cart.version,
      });
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.deleteSuccess),
      });
      await onClose();
    }
  };

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

  if (!cart) {
    return <PageNotFound />;
  }

  const handleUpdateCart = (actions: Array<TCartUpdateAction>) => {
    return cartUpdater
      .execute({
        actions: actions,
        id: cart.id,
        version: cart.version,
        locale: dataLocale,
      })
      .then(() => {
        refetch().then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.cartUpdated),
          });
        });
      })
      .catch(graphQLErrorHandler(showNotification));
  };

  const handleRemoveDiscountCode = async (id: string) => {
    await handleUpdateCart([
      {
        removeDiscountCode: {
          discountCode: {
            typeId: 'discount-code',
            id,
          },
        },
      },
    ]);
  };

  const handleApplyDiscountCode = async (code: string) =>
    await handleUpdateCart([
      {
        addDiscountCode: { code: code },
      },
    ]);

  const handleCartAction = async () => {
    if (cart.cartState === TCartState.Active) {
      await handleUpdateCart([{ freezeCart: { dummy: '' } }]).catch(
        graphQLErrorHandler(showNotification)
      );
    } else if (cart.cartState === TCartState.Frozen) {
      await handleUpdateCart([{ unfreezeCart: { dummy: '' } }]).catch(
        graphQLErrorHandler(showNotification)
      );
    }
  };

  const handleApplyDirectDiscount = async (
    directDiscounts: Array<TDirectDiscountDraft>
  ) =>
    await handleUpdateCart([
      {
        setDirectDiscounts: {
          discounts: directDiscounts,
        },
      },
    ]);

  return (
    <CustomFormModalPage
      title={intl.formatMessage(messages.title)}
      subtitle={cart.id}
      topBarPreviousPathLabel={intl.formatMessage(messages.previous)}
      isOpen={true}
      onClose={onClose}
      formControls={
        <>
          {(cart.cartState === TCartState.Active ||
            cart.cartState === TCartState.Frozen) && (
            <CustomFormModalPage.FormSecondaryButton
              onClick={handleCartAction}
              label={
                cart.cartState === TCartState.Active
                  ? 'Freeze Cart'
                  : 'Unfreeze'
              }
            />
          )}
          <CustomFormModalPage.FormDeleteButton
            onClick={() => handleDelete()}
          />
        </>
      }
    >
      <PageContentWide>
        <Spacings.Stack scale="xl">
          <CartDetailsGeneralInfoHeader cart={cart} />
          <Spacings.Stack scale="xl">
            <CartDetailsItems cart={cart} />

            <CartAppliedDiscountsPanel
              cart={cart}
              onApplyDiscountCode={handleApplyDiscountCode}
              onRemoveDiscountCode={handleRemoveDiscountCode}
              onApplyDirectDiscount={handleApplyDirectDiscount}
              canManage={canManage}
            />
          </Spacings.Stack>
          {(cart.lineItems.length >= 1 || cart.customLineItems.length >= 1) && (
            <Card type="raised">
              <CartSummaryPricingBreakdown cart={cart} />
            </Card>
          )}
          <AddressesPanel cart={cart} />
        </Spacings.Stack>
      </PageContentWide>
    </CustomFormModalPage>
  );
};

export default CustomerCart;
