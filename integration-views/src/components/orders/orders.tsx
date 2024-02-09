import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';

import OrderDetails from './order-details';

const Orders = () => {
  const { hostUrl } = useCustomViewContext((context) => ({
    hostUrl: context.hostUrl,
  }));

  let orderId = undefined;
  if (hostUrl) {
    const splittedUrl = hostUrl.split('/');
    const ordersIndex = splittedUrl.indexOf('orders');
    if (ordersIndex === -1) {
      return (
        <ContentNotification type="error">
          <Text.Body>{`Cannot find "orders" in ${hostUrl}`}</Text.Body>
        </ContentNotification>
      );
    }
    orderId = splittedUrl[ordersIndex + 1];
  }
  if (!orderId) {
    return (
      <ContentNotification type="error">
        <Text.Body>{`Cannot find order id`}</Text.Body>
      </ContentNotification>
    );
  }

  return <OrderDetails orderId={orderId} />;
};

export default Orders;
