import { FC, useState } from 'react';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNotFound } from '@commercetools-frontend/application-components';
import {
  getErrorMessage,
  useCustomerConfirmEmail,
  useCustomerCreateEmailVerificationToken,
  useCustomerFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import PrimaryButton from '@commercetools-uikit/primary-button';

type Props = { id: string };

export const CustomerActions: FC<Props> = ({ id }) => {
  const { customer, loading, error } = useCustomerFetcher({
    id: id,
  });

  const [updateState, setUpdateState] = useState('');

  const { execute: customerCreateEmailVerificationToken } =
    useCustomerCreateEmailVerificationToken();
  const { execute: customerConfirmEmail } = useCustomerConfirmEmail();

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
  if (!customer) {
    return <PageNotFound />;
  }

  const onClick = () => {
    customerCreateEmailVerificationToken({ id: id, ttlMinutes: 100 })
      .then(({ customerCreateEmailVerificationToken }) => {
        const token = customerCreateEmailVerificationToken?.value;
        if (token) {
          customerConfirmEmail({ tokenValue: token })
            .then(() => {
              setUpdateState('Customer verified');
            })

            .catch((error) => {
              setUpdateState(error);
            });
        } else {
          setUpdateState('No token generated');
        }
      })
      .catch((error) => {
        setUpdateState(error);
      });
  };

  return (
    <Spacings.Stack scale={'l'}>
      <Text.Detail>This customer has not yet verified their email.</Text.Detail>
      <Spacings.Inline scale={'l'}>
        <PrimaryButton label={'Verify now'} onClick={onClick} />
      </Spacings.Inline>
      <Text.Detail>{updateState}</Text.Detail>
    </Spacings.Stack>
  );
};

export default CustomerActions;
