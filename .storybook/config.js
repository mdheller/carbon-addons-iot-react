import React from 'react';
import { configure, addDecorator, addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import { withA11y } from '@storybook/addon-a11y';
import { withKnobs } from '@storybook/addon-knobs';
import { initializeRTL } from 'storybook-addon-rtl';
import theme from './theme';

initializeRTL();

import Container from './Container';

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
  options: {
    theme: theme,
    storySort: (a, b) =>
      a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, { numeric: true }),
  },
});

addDecorator(story => <Container story={story} />);
addDecorator(withA11y);
addDecorator(withKnobs);

function loadStories() {
  const req = require.context('../src/components', true, /\.story\.jsx$/);

  // Stories without a default export do not need to be included in the array returned from this function
  // The only stories with a default export should be ones written in the CSF format
  const stories = req
    .keys()
    .map(fname => req(fname))
    .filter(exp => exp.default && Object.entries(exp.default).length);

  // some stories need added manually because they don't match the initial glob
  stories.push(require('./Welcome.story.jsx'));

  // return the array of req's
  return stories;
}

configure(loadStories, module);
