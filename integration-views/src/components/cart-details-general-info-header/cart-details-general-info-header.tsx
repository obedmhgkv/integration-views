import { FC } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { TCart } from '../../types/generated/ctp';
import { ContentNotification } from '@commercetools-uikit/notifications';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { CartDetailsGeneralInfoHeader as ExternalCartDetailsGeneralInfoHeader } from 'commercetools-demo-shared-cart-handling';
import {
  getErrorMessage,
  useOrdersFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';

type Props = { cart: TCart };
const CartDetailsGeneralInfoHeader: FC<Props> = ({ cart }) => {
  const { orders, loading, error } = useOrdersFetcher({
    offset: 0,
    limit: 10,
    where: `cart(id="${cart.id}")`,
  });
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

  if (!orders || !orders.results) {
    return <PageNotFound />;
  }

  return (
    <ExternalCartDetailsGeneralInfoHeader
      cart={cart}
      orderId={orders.results[0]?.id}
    />
  );
};

CartDetailsGeneralInfoHeader.displayName = 'OrderDetailsGeneralInfoTabHeader';

export default CartDetailsGeneralInfoHeader;
