import {
  Header as CarbonHeader,
  HeaderMenuButton,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  HeaderMenuItem,
  HeaderPanel,
} from 'carbon-components-react/lib/components/UIShell';
import AppSwitcher from '@carbon/icons-react/lib/app-switcher/20';
import { rem } from 'polished';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';

import { COLORS } from '../../styles/styles';

import HeaderMenu from './HeaderMenu';

const StyledHeader = styled(CarbonHeader)`
  &&& {
    .bx--skip-to-content:focus {
      min-width: 240px;
      justify-content: center;
      border: 0.125rem solid ${COLORS.white};
    }

    .bx--header__menu-toggle {
      display: block;
    }

    .bx--header__menu-title[role='menuitem'][aria-expanded='true'] + .bx--header__menu {
      left: auto;
      right: 0;
    }

    .bx--header__menu {
      min-width: 12.5rem;
      width: auto;
    }

    .bx--header__menu-item[role='menuitem']:focus {
      border-color: ${COLORS.white};
      outline: none;
    }
  }
`;
const StyledGlobalAction = styled(HeaderGlobalAction)`
  &&& {
    align-items: center;
    display: flex;
    justify-content: center;
    min-width: 3rem;
    padding: 0 ${rem(15)};
    position: relative;
    width: auto;

    span {
      display: flex;
    }
  }
`;

const propTypes = {
  /** Add a prefix other than IBM */
  prefix: PropTypes.string,
  /** Name to follow the IBM prefix up top, left */
  appName: PropTypes.string.isRequired,
  /** Add a class name to Header */
  className: PropTypes.string,
  /** Provide ID for the skip to content functionality */
  skipto: PropTypes.string,
  /** href optional url to file if you click on title */
  url: PropTypes.string,
  /** Object of action items */
  actionItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      /** declare control of header panel from this action item. Can only be one panel for now */
      // @TODO: allow  mutliple header panels
      headerPanel: PropTypes.bool,
      btnContent: PropTypes.any.isRequired,
      childContent: PropTypes.arrayOf(
        PropTypes.shape({
          /** extra data to pass to HeaderMenuLink (aria-*, href, target, etc.) */
          metaData: PropTypes.object,
          /** Optionally pass in an onClick handler to trigger action  */
          onClick: PropTypes.func,
          content: PropTypes.any.isRequired,
        })
      ),
    })
  ).isRequired,
  /** Bit to flip that tells header to render the nav toggle button */
  hasSideNav: PropTypes.bool,
  onClickSideNavExpand: PropTypes.func,
  /** Header panel props */
  headerPanel: PropTypes.shape({
    /** Optionally provide a custom class to apply to the underlying <li> node */
    className: PropTypes.string,
    /** the content of the header panel  */
    content: PropTypes.any,
  }),
};

const defaultProps = {
  onClickSideNavExpand: null,
  hasSideNav: true,
  prefix: 'IBM',
  className: 'main-header',
  skipto: '#main-content',
  headerPanel: null,
  url: '#',
};

/**
 * Clickable card that shows "Add" button
 */
const Header = ({
  appName,
  className,
  actionItems,
  prefix,
  skipto,
  hasSideNav,
  onClickSideNavExpand,
  headerPanel,
  url,
}) => {
  const [expanded, setExpanded] = useState(false);
  const handleHeaderPanelTriggerClick = useCallback(
    () => {
      setExpanded(!expanded);
    },
    [expanded]
  );
  const actionBtnContent = actionItems.map(item => {
    if (item.hasOwnProperty('childContent')) {
      const children = item.childContent.map(childItem => (
        <HeaderMenuItem
          key={`menu-item-${item.label + item.childContent.indexOf(childItem)}-child`}
          {...childItem.metaData}
        >
          {childItem.content}
        </HeaderMenuItem>
      ));
      return (
        <HeaderMenu
          key={`menu-item-${item.label}`}
          aria-label={item.label}
          isMenu={false}
          renderMenuContent={() => item.btnContent}
          menuLinkName={item.menuLinkName ? item.menuLinkName : ''}
        >
          {children}
        </HeaderMenu>
      );
    }
    return (
      <StyledGlobalAction
        key={`menu-item-${item.label}-global`}
        aria-label={item.label}
        onClick={item.onClick}
      >
        {item.btnContent}
      </StyledGlobalAction>
    );
  });
  if (headerPanel) {
    actionBtnContent.push(
      <StyledGlobalAction
        aria-label="header-panel-trigger"
        key="AppSwitcher"
        onClick={handleHeaderPanelTriggerClick}
      >
        <AppSwitcher fill="white" description="Icon" />
      </StyledGlobalAction>
    );
  }

  return (
    <StyledHeader className={className} aria-label="main header">
      <SkipToContent href={skipto} />
      {hasSideNav && <HeaderMenuButton aria-label="Open menu" onClick={onClickSideNavExpand} />}
      <HeaderName href={url} prefix={prefix}>
        {appName}
      </HeaderName>
      <HeaderGlobalBar>{actionBtnContent}</HeaderGlobalBar>
      {headerPanel && (
        <HeaderPanel
          aria-label="Header Panel"
          className={headerPanel.className ? headerPanel.className : null}
          expanded={expanded}
        >
          <div>
            <headerPanel.content />
          </div>
        </HeaderPanel>
      )}
    </StyledHeader>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
