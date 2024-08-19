import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'Claims.title',
    defaultMessage: 'Claims list',
  },
  subtitle: {
    id: 'Claims.subtitle',
    defaultMessage: 'Logged-id user: {firstName} {lastName}',
  },
  demoHint: {
    id: 'Claims.demoHint',
    defaultMessage:
      'This page demonstrates how you can develop a component following some of the Merchant Center UX Guidelines and development best practices. For instance, fetching data using GraphQL, displaying data in a paginated table, writing functional tests, etc.',
  },
  noResults: {
    id: 'Claims.noResults',
    defaultMessage: 'There are no Claims available in this project.',
  },
});
