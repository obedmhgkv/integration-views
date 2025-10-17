import { FC } from 'react';
import PredicateConfiguratorFormikField from 'commercetools-demo-shared-predicate-builder';
import { FormikProvider, useFormik } from 'formik';
import { TFormValues } from './category';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import PrimaryButton from '@commercetools-uikit/primary-button';
import {
  CustomFormMainPage,
  InfoMainPage,
} from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import { TRawCustomField } from 'commercetools-demo-shared-helpers';
import SecondaryButton from '@commercetools-uikit/secondary-button';

export type Props = {
  existingValue?: TRawCustomField;
  onSubmit: (values: TFormValues) => Promise<void>;
};

const CategoryPredicateField: FC<Props> = ({ existingValue, onSubmit }) => {
  const intl = useIntl();

  const formik = useFormik<TFormValues>({
    initialValues: {
      predicateField: (existingValue?.value as unknown as string) || '',
    },
    onSubmit: onSubmit,
  });
  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h1">Category View</Text.Headline>
          <Spacings.Inline>
            <PrimaryButton
              onClick={formik.submitForm}
              isDisabled={formik.isSubmitting || !formik.dirty}
              label={intl.formatMessage(CustomFormMainPage.Intl.save)}
            />
            <SecondaryButton
              label={intl.formatMessage(CustomFormMainPage.Intl.delete)}
            />
          </Spacings.Inline>
        </Spacings.Inline>
      }
    >
      <FormikProvider value={formik}>
        <PredicateConfiguratorFormikField name={'predicateField'} />
      </FormikProvider>
    </InfoMainPage>
  );
};

export default CategoryPredicateField;
