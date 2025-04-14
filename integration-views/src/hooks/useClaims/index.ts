import axios from 'axios';
import ClaimMapper from '../../mappers/ClaimMapper';

//import { useClaimsReturn } from './types';

const useClaims = (): any => {
  const getClaims = async (customerId: string) => {
    try {
      const response = await axios.get(
        `https://api.trello.com/1/lists/66a257024b757ca8f82b9722/cards?key=fc8fa9f2fcd36decbfdb1402213c0a32&token=ATTA202d3a9048c050e21d10318749e46d5d28f76d0ac60187c970dc7cba146f179578C9F56D`
      );
      const data = response.data;
      const mappedClaimData = await Promise.all(
        data.map(async (claim: any) => await ClaimMapper.mapClaim(claim))
      );

      const filteredClaimData = mappedClaimData.filter(
        (claim: any) => claim.accountId === customerId
      );
      return filteredClaimData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getClaimDetails = async (cardId: string) => {
    return await axios
      .get(
        `https://api.trello.com/1/cards/${cardId}/actions?key=fc8fa9f2fcd36decbfdb1402213c0a32&token=ATTA202d3a9048c050e21d10318749e46d5d28f76d0ac60187c970dc7cba146f179578C9F56D`
      )
      .then((response: { data: any }) => {
        return response.data;
      })
      .then((data: any) => {
        return data;
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  return { getClaims, getClaimDetails };
};

export default useClaims;
