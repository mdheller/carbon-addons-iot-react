import delay from 'lodash/delay';
import moment from 'moment';

import {
  GUTTER,
  DASHBOARD_BREAKPOINTS,
  CARD_DIMENSIONS,
  ROW_HEIGHT,
  DASHBOARD_COLUMNS,
} from '../constants/LayoutConstants';

/** This function assumes you're using carbon widgets */
export function scrollErrorIntoView(focus = true) {
  const invalidField = document.querySelector('[data-invalid="true"]');
  if (invalidField) {
    invalidField.scrollIntoView({ behavior: 'smooth' });
    if (focus) {
      delay(() => invalidField.focus(), 250);
    }
    return true;
  }
  return false;
}

export const handleEnterKeyDown = (evt, callback) => {
  if (evt.key === 'Enter') {
    callback(evt);
  }
};

export const defaultFunction = name => () => console.info(`${name} not implemented`); //eslint-disable-line

export const getSortedData = (inputData, columnId, direction, isTimestampColumn) => {
  // clone inputData because sort mutates the array
  const sortedData = inputData.map(i => i);

  return sortedData.sort((a, b) => {
    const val = direction === 'ASC' ? -1 : 1;
    if (a.values[columnId] === null) {
      return 1;
    }
    if (b.values[columnId] === null) {
      return -1;
    }
    if (isTimestampColumn) {
      // support the sort if we have column with timestamp
      const dateA = moment(a.values[columnId]);
      const dateB = moment(b.values[columnId]);

      if (dateA < dateB) {
        return val;
      }
      if (dateA > dateB) {
        return -val;
      }
    }
    if (typeof a.values[columnId] === 'string' && !Number(a.values[columnId])) {
      const compare = a.values[columnId].localeCompare(b.values[columnId]);
      return direction === 'ASC' ? compare : -compare;
    }
    if (Number(a.values[columnId]) < Number(b.values[columnId])) {
      return val;
    }
    if (Number(a.values[columnId]) > Number(b.values[columnId])) {
      return -val;
    }

    return 0;
  });
};

export const stopPropagationAndCallback = (evt, callback, ...args) => {
  evt.stopPropagation();
  callback(...args);
};

// Dashboard layout
const gridHeight = 50;

export const printGrid = grid => {
  // console.log(`printGrid: ${grid}`);
  let result = '';
  for (let j = 0; j < gridHeight; j += 1) {
    for (let i = 0; i < grid.length; i += 1) {
      result += `${grid[i][j]} `;
    }
    result += '\n';
  }
  console.log(result); // eslint-disable-line
};

export const canFit = (x, y, w, h, grid) => {
  // console.log(`canFit? x=${x}, y=${y}, w=${w}, h=${h}`);
  for (let i = x; i < x + w; i += 1) {
    for (let j = y; j < y + h; j += 1) {
      if (grid.length === i) return false;
      if (grid[i].length === j) return false;
      if (grid[i][j] !== 0) return false;
    }
  }
  return true;
};

/** Generates a non overlapping layout given the cards and column/dimension configuration for a given layout */
export const getLayout = (layoutName, cards, dashboardColumns, cardDimensions) => {
  let currX = 0;
  let currY = 0;
  const grid = Array(dashboardColumns[layoutName])
    .fill(0)
    .map(() => Array(gridHeight).fill(0));

  const placeCard = (x, y, w, h, num) => {
    // console.log(`placeCard: x=${x}, y=${y}, w=${w}, h=${h}, cardNum=${num}`);
    for (let i = x; i < x + w; i += 1) {
      for (let j = y; j < y + h; j += 1) {
        grid[i][j] = num;
      }
    }
  };

  const layout = cards
    .map((card, index) => {
      const { w, h } = cardDimensions[card.size][layoutName];
      // console.log(`trying ${card.id} (w = ${w}, h = ${h}) at ${currX},${currY}`);
      while (!canFit(currX, currY, w, h, grid)) {
        // console.log('didnt fit...');
        currX += 1;
        if (currX > dashboardColumns[layoutName]) {
          currX = 0;
          currY += 1;
          if (currY > gridHeight) {
            return null;
          }
        }
      }
      // console.log('it fits!');
      placeCard(currX, currY, w, h, index + 1);
      // printGrid(grid);
      const cardLayout = {
        i: card.id,
        x: currX,
        y: currY,
        w,
        h,
      };
      currX += w;
      // console.log(`adding ${card.id} (w = ${w}, h = ${h}) at ${cardLayout.x},${cardLayout.y}`);
      return cardLayout;
    })
    .filter(i => i !== null);
  // printGrid(grid);
  return layout;
};

/**
 * Returns { x: width in pixels, y: height in pixels }
 * This is used to set min-width and min-height of the card based on the current breakpoint
 */
export const getCardMinSize = (
  breakpoint,
  size,
  dashboardBreakpoints = DASHBOARD_BREAKPOINTS,
  cardDimensions = CARD_DIMENSIONS,
  rowHeight = ROW_HEIGHT,
  dashboardColumns = DASHBOARD_COLUMNS
) => {
  const totalCol = dashboardColumns[breakpoint];
  const columnWidth = (dashboardBreakpoints[breakpoint] - (totalCol - 1) * GUTTER) / totalCol;
  const cardColumns = cardDimensions[size][breakpoint].w;
  const cardRows = cardDimensions[size][breakpoint].h;

  const cardSize = {
    x: cardColumns * columnWidth + (cardColumns - 1) * GUTTER,
    y: cardRows * rowHeight[breakpoint] + (cardRows - 1) * GUTTER,
  };
  // console.log('getCardMinSize', breakpoint, size, rowHeight, ` = ${JSON.stringify(cardSize)}`);
  return cardSize;
};
