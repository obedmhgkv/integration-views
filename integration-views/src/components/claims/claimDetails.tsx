import React, { useState, useEffect } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Card from '@commercetools-uikit/card';

import { CSSTransition } from 'react-transition-group';
import './SlideTransition.css'; // Make sure to create this CSS file
import useClaims from '../../hooks/useClaims';

const SlideStack = ({
  selectedClaim,
  onBack,
}: {
  selectedClaim: any;
  onBack: () => void;
}) => {
  const { getClaimDetails } = useClaims();
  const [show, setShow] = useState(false);
  const [claimData, setClaimData] = useState([]);

  useEffect(() => {
    if (Object.keys(selectedClaim).length > 0) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [selectedClaim]);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      const response = await getClaimDetails(selectedClaim.id);
      response.reverse();
      setClaimData(response);
    };
    fetchClaimDetails();
  }, [selectedClaim]);

  const handleBack = () => {
    setShow(false); // Trigger slide out animation
    setTimeout(() => {
      onBack(); // Execute the back action after the animation completes
    }, 300); // Match the timeout duration of the CSS transition
  };

  return (
    <CSSTransition in={show} timeout={300} classNames="slide" unmountOnExit>
      <Spacings.Stack scale="m">
        <div>
          <span
            onClick={handleBack}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            <Text.Body as="span">{`< Back to Requests`}</Text.Body>
          </span>
        </div>
        <Text.Headline as="h2">Support Details</Text.Headline>
        <div>
          <div className="gap-10">
            <Text.Body as="p">{`Title: ${selectedClaim.name}`}</Text.Body>

            <Text.Body as="p">{`Status: ${selectedClaim.status}`}</Text.Body>

            <Text.Body as="p">{`Description:`}</Text.Body>

            <div className="between-space">
              <Card theme="dark" type="raised">
                {selectedClaim.desc}
              </Card>
            </div>
          </div>
          <div className="between-space">
            <Text.Body as="p">Request History:</Text.Body>
            <Card theme="light" type="raised">
              {claimData?.map((history: any) => (
                <div className="mt-5" key={history.index}>
                  <pre>
                    {`${history.memberCreator.fullName} on ${new Date(
                      history.date
                    ).toLocaleDateString()}:`}
                  </pre>
                  <Card theme="dark" type="raised">
                    <p className="break-all ">{history.data.text}</p>
                  </Card>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </Spacings.Stack>
    </CSSTransition>
  );
};

export default SlideStack;
