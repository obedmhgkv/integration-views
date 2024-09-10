import type { ApolloError } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type {
  TMutation,
  TMutation_CustomerConfirmEmailArgs,
  TMutation_CustomerCreateEmailVerificationTokenArgs,
  TQuery,
  TQuery_CustomerArgs,
} from '../../types/generated/ctp';
import FetchCustomerQuery from './fetch-customer.ctp.graphql';
import CustomerCreateEmailVerificationToken from './customer-create-email-verification-token.ctp.graphql';
import CustomerConfirmEmail from './customer-confirm-email.ctp.graphql';
import { extractErrorFromGraphQlResponse } from '../../helpers';

type TUseCustomerFetcher = (variables: TQuery_CustomerArgs) => {
  customer?: TQuery['customer'];
  error?: ApolloError;
  loading: boolean;
};

export const useCustomerFetcher: TUseCustomerFetcher = (variables) => {
  const { data, error, loading } = useMcQuery<TQuery, TQuery_CustomerArgs>(
    FetchCustomerQuery,
    {
      variables: variables,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );

  return {
    customer: data?.customer,
    error,
    loading,
  };
};

export const useCustomerCreateEmailVerificationToken = () => {
  const [customerCreateEmailVerificationToken, { loading }] = useMcMutation<
    TMutation,
    TMutation_CustomerCreateEmailVerificationTokenArgs
  >(CustomerCreateEmailVerificationToken);

  const execute = async (
    variables: TMutation_CustomerCreateEmailVerificationTokenArgs
  ) => {
    try {
      return await customerCreateEmailVerificationToken({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
    } catch (graphQlResponse) {
      console.log(graphQlResponse);
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useCustomerConfirmEmail = () => {
  const [customerConfirmEmail, { loading }] = useMcMutation<
    TMutation,
    TMutation_CustomerConfirmEmailArgs
  >(CustomerConfirmEmail);

  const execute = async (variables: TMutation_CustomerConfirmEmailArgs) => {
    try {
      return await customerConfirmEmail({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
    } catch (graphQlResponse) {
      console.log(graphQlResponse);
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};
