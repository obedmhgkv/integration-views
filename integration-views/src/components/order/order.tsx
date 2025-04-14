import { FC, useMemo } from 'react';
import { TLineItem } from '../../types/generated/ctp';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { InfoMainPage } from '@commercetools-frontend/application-components';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import DataTable from '@commercetools-uikit/data-table';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import Label from '@commercetools-uikit/label';
import Grid from '@commercetools-uikit/grid';
import OrderDetailsItem from './order-details-item';
import {
  PlusBoldIcon,
  ExportIcon,
  SpeechBubbleIcon,
} from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { ComponentProps } from '../../routes';
import Steps from 'commercetools-demo-shared-stepper';
import {
  getErrorMessage,
  useOrderFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { formatLocalizedString } from 'commercetools-demo-shared-helpers';

const Order: FC<ComponentProps> = ({ id }) => {
  const { dataLocale, projectLanguages, googleMapOrigin, googleMapKey } =
    useCustomViewContext((context) => {
      const googleMapKey =
        'googleMapKey' in context.environment
          ? context.environment.googleMapKey
          : undefined;
      const googleMapOrigin =
        'googleMapOrigin' in context.environment
          ? context.environment.googleMapOrigin
          : undefined;
      return {
        dataLocale: context.dataLocale ?? '',
        projectLanguages: context.project?.languages ?? [],
        googleMapKey: googleMapKey,
        googleMapOrigin: googleMapOrigin,
      };
    });
  const createStepsDefinition = useMemo(
    () => [
      {
        key: 'Ordered',
        label: 'Ordered',
      },
      {
        key: 'Picking',
        label: 'Picking',
      },
      {
        key: 'Picked',
        label: 'Picked',
      },
      {
        key: 'ReadyToShip',
        label: 'Ready To Ship',
      },
      {
        key: 'InTransit',
        label: 'In Transit',
      },
      {
        key: 'Delivered',
        label: 'Delivered',
      },
    ],
    []
  );
  const { order, error, loading } = useOrderFetcher({
    id: id,
  });

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!loading && !order) {
    return (
      <ContentNotification type="info">
        <Text.Body>No Results</Text.Body>
      </ContentNotification>
    );
  }

  let to: string = '';
  if (order?.shippingAddress) {
    const address = order?.shippingAddress;
    if (address?.streetName) {
      to += address?.streetName + '+';
      if (address?.streetNumber) {
        to += address?.streetName + '+';
      }
    }
    if (address?.postalCode) {
      to += address?.postalCode + '+';
    }
    if (address?.city) {
      to += address?.city + '+';
    }
  }

  const today = new Date();
  const deliveryStepy = [
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'In Transit',
      body: 'On its way',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'In Transit',
      body: 'Arrived at Station',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'In Transit',
      body: 'Arrived at Facility',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'Transit Start',
      body: 'Leaving our warehouse',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'Picking',
      body: 'All items picked',
    },
    {
      date: today.setDate(today.getDate() - 1),
      headline: 'Picking',
      body: 'Started',
    },
  ];

  return (
    <InfoMainPage
      title="Order Tracking Form"
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">Order Tracking Form</Text.Headline>
          <Spacings.Inline justifyContent="space-between">
            <PrimaryButton iconLeft={<PlusBoldIcon />} label={'Open in OMS'} />
            <SecondaryButton
              iconLeft={<SpeechBubbleIcon />}
              label={'Log Complaint'}
            />
            <SecondaryButton
              iconLeft={<ExportIcon />}
              label={'Export as XLS'}
            />
          </Spacings.Inline>
        </Spacings.Inline>
      }
      subtitle={'This data is coming directly from the Order Management System'}
    >
      <Card theme="light" type="raised">
        <Spacings.Stack scale={'xl'}>
          <Grid
            gridGap="16px"
            gridAutoColumns="1fr"
            gridTemplateColumns="repeat(2, 1fr)"
          >
            <Grid.Item>
              <DataTable<TLineItem>
                rows={order?.lineItems || []}
                columns={[
                  { key: 'image', label: 'Image' },
                  { key: 'name', label: 'Name' },
                ]}
                itemRenderer={(item, column) => {
                  switch (column.key) {
                    case 'id':
                      return item.id;
                    case 'image':
                      return (
                        <div style={{ width: '50px', height: '50px' }}>
                          <img
                            src={item.variant?.images?.[0]?.url}
                            style={{
                              verticalAlign: 'middle',
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      );
                    case 'name':
                      return formatLocalizedString(
                        item.nameAllLocales ?? [],
                        dataLocale,
                        projectLanguages,
                        NO_VALUE_FALLBACK
                      );
                    default:
                      return null;
                  }
                }}
              />
            </Grid.Item>
            <Grid.Item>
              <Spacings.Stack>
                <Spacings.Inline
                  justifyContent={'space-between'}
                  alignItems={'flex-start'}
                  scale={'m'}
                >
                  <Label>Order ID:</Label>
                  <Text.Body>{order?.id}</Text.Body>
                </Spacings.Inline>
                <Spacings.Inline
                  justifyContent={'space-between'}
                  alignItems={'flex-start'}
                  scale={'m'}
                >
                  <Label>Carrier</Label>
                  <Text.Body>DHL</Text.Body>
                </Spacings.Inline>
              </Spacings.Stack>
            </Grid.Item>
          </Grid>

          <Steps steps={createStepsDefinition} activeStepKey={'InTransit'} />
          <Grid
            gridGap="16px"
            gridAutoColumns="1fr"
            gridTemplateColumns="repeat(2, 1fr)"
          >
            <Grid.Item>
              <Spacings.Stack scale={'m'}>
                {deliveryStepy.map((item, index) => {
                  return <OrderDetailsItem {...item} key={index} />;
                })}
              </Spacings.Stack>
            </Grid.Item>
            {to.length > 0 && (
              <Grid.Item>
                <iframe
                  width="100%"
                  height="450"
                  frameBorder={0}
                  style={{ border: 0 }}
                  referrerPolicy={'no-referrer-when-downgrade'}
                  src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapKey}&origin=${googleMapOrigin}&destination=${to}`}
                />
              </Grid.Item>
            )}
          </Grid>
        </Spacings.Stack>
      </Card>
    </InfoMainPage>
  );
};

export default Order;
