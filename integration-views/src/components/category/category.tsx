import { FC } from 'react';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { ComponentProps } from '../../routes';
import {
  getErrorMessage,
  graphQLErrorHandler,
  useCategoryFetcher,
  useCategoryUpdater,
  useTypeDefinitionFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import CategoryPredicateField from './category-predicate-field';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';

export type TFormValues = {
  predicateField?: string;
};

const Category: FC<ComponentProps> = ({ id }) => {
  const showNotification = useShowNotification();
  const { execute } = useCategoryUpdater();
  const {
    typeDefinition,
    error: stateError,
    loading: stateLoading,
  } = useTypeDefinitionFetcher({
    key: 'dynamic-category-assignment',
  });
  const { category, error, loading, refetch } = useCategoryFetcher({
    id: id,
    includeCustomFields: true,
  });

  const existingValue = category?.custom?.customFieldsRaw?.find(
    (item) => item.name === 'predicateField'
  );
  const submit = async (values: TFormValues) => {
    if (category) {
      await execute({
        actions: existingValue
          ? [
              {
                setCustomField: {
                  name: 'predicateField',
                  value: JSON.stringify(values.predicateField),
                },
              },
            ]
          : [
              {
                setCustomType: {
                  typeKey: 'dynamic-category-assignment',
                  fields: [
                    {
                      name: 'predicateField',
                      value: JSON.stringify(values.predicateField),
                    },
                  ],
                },
              },
            ],
        version: category.version,
        id: category.id,
      })
        .then(() => {
          return refetch();
        })
        .catch(graphQLErrorHandler(showNotification));
    }
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (stateError) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(stateError)}</Text.Body>
      </ContentNotification>
    );
  }

  if (loading || stateLoading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <ContentNotification type="info">
        <Text.Body>No Results</Text.Body>
      </ContentNotification>
    );
  }

  if (
    !typeDefinition ||
    !typeDefinition.fieldDefinitions.find(
      (fieldDefinition) => fieldDefinition.name === 'predicateField'
    )
  ) {
    return (
      <ContentNotification type="info">
        <Text.Body>{`Missing Type with key "dynamic-category-assignment" for "category" with string field "predicateField"`}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <CategoryPredicateField existingValue={existingValue} onSubmit={submit} />
  );
};

export default Category;
