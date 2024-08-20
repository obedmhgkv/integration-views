import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';

import useClaims from '../../hooks/useClaims';
import { FC, useEffect, useState } from 'react';
import DataTableManager from '@commercetools-uikit/data-table-manager';
import DataTable from '@commercetools-uikit/data-table';

import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import SlideStack from './claimDetails';
import { UserLinearIcon } from '@commercetools-uikit/icons';

interface Claim {
  id: string;
  name: string;
  desc: string;
  due: string;
  customFields: any[];
}

type Props = { id: string };

const Claims: FC<Props> = ({ id }) => {
  const hostUrl = useCustomViewContext((context) => context.hostUrl);
  const url = new URL(hostUrl);

  const customerId = id;
  const { getClaims } = useClaims();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>();
  function onBack() {
    setSelectedClaim(null);
  }

  useEffect(() => {
    const fetchClaims = async () => {
      const response = await getClaims(customerId);
      setClaims(response);
    };
    fetchClaims();
  }, []);

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'claimNumber', label: 'Number' },
    { key: 'accountId', label: 'Account Id' },
    { key: 'name', label: 'Description' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ];

  return (
    <Spacings.Stack scale="xl">
      {selectedClaim ? (
        <SlideStack selectedClaim={selectedClaim} onBack={onBack} />
      ) : (
        <Spacings.Stack scale="s">
          <Text.Headline as="h2">
            <UserLinearIcon /> Customer Requests:
          </Text.Headline>

          <Text.Subheadline as="h4"></Text.Subheadline>
          <hr />
          {claims.length > 0 ? (
            <DataTableManager columns={columns}>
              <DataTable
                rows={claims}
                onRowClick={(item, index) => setSelectedClaim(item)}
              />
            </DataTableManager>
          ) : (
            <div>
              <Text.Body as="p">
                No requests available for this customer.
              </Text.Body>
            </div>
          )}
        </Spacings.Stack>
      )}
    </Spacings.Stack>
  );
};
Claims.displayName = 'Claims';

export default Claims;
