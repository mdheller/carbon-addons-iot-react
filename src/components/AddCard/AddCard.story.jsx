import React from 'react';
import { action } from '@storybook/addon-actions';

import AddCard from './AddCard';

export default {
  title: 'Watson IoT|AddCard',
};

export const handlesClick = () => <AddCard onClick={action('clicked')} title="Click me" />;

handlesClick.story = {
  name: 'handles click',
};
