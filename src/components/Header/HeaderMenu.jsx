import ChevronDownGlyph from '@carbon/icons-react/lib/chevron--down';
import { settings } from 'carbon-components';
import cx from 'classnames';
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const { prefix } = settings;

/* eslint-disable */

const defaultRenderMenuContent = ({ ariaLabel }) => (
  <>
    {ariaLabel}
    <ChevronDownGlyph className={`${prefix}--header__menu-arrow`} />
  </>
);

export const keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  PAGEUP: 33,
  PAGEDOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

export function matches(event, keysToMatch) {
  for (let i = 0; i < keysToMatch.length; i++) {
    if (keysToMatch[i] === event.which) {
      return true;
    }
  }
  return false;
}

/**
 * `HeaderMenu` is used to render submenu's in the `Header`. Most often children
 * will be a `HeaderMenuItem`. It handles certain keyboard events to help
 * with managing focus. It also passes along refs to each child so that it can
 * help manage focus state of its children.
 */
class HeaderMenu extends React.Component {
  static propTypes = {
    /**
     * Bit to switch if you want HeaderMenu to render inside nav or in action bar
     */
    isMenu: PropTypes.bool,
    /**
     * Provide a custom ref handler for the menu button
     */
    focusRef: PropTypes.func,

    /**
     * Optionally provide a tabIndex for the underlying menu button
     */
    tabIndex: PropTypes.number,

    /**
     * Optional component to render instead of string
     */
    renderMenuContent: PropTypes.func,
  };

  static defaultProps = {
    renderMenuContent: defaultRenderMenuContent,
    isMenu: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      // Used to manage the expansion state of the menu
      expanded: false,
      // Refers to the menuitem that is currently focused
      // Note: children should have `role="menuitem"` on node consuming ref
      selectedIndex: null,
    };
    this.items = [];
  }

  /**
   * Toggle the expanded state of the menu on click.
   */
  handleOnClick = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded,
    }));
  };

  /**
   * Keyboard event handler for the entire menu.
   */
  handleOnKeyDown = event => {
    // Handle enter or space key for toggling the expanded state of the menu.
    if (matches(event, [keys.ENTER, keys.SPACE])) {
      event.stopPropagation();
      event.preventDefault();

      this.setState(prevState => ({
        expanded: !prevState.expanded,
      }));
    }
  };

  /**
   * Handle our blur event from our underlying menuitems. Will mostly be used
   * for toggling the expansion status of our menu in response to a user
   * clicking off of the menu or menubar.
   */
  handleOnBlur = event => {
    // Rough guess for a blur event that is triggered outside of our menu or
    // menubar context
    if (!event.currentTarget.contains(event.relatedTarget)) {
      this.setState({ expanded: false, selectedIndex: null });
    }
  };

  /**
   * ref handler for our menu button. This node is represented by the
   * `role="menu"` attribute. If we are supplied a `focusRef` prop, we also
   * forward along the node.
   *
   * This is useful when this component is a child in a
   * menu or menubar as it will allow the parent to explicitly focus the menu
   * button node when that child should receive focus.
   */
  handleMenuButtonRef = node => {
    if (this.props.focusRef) {
      this.props.focusRef(node);
    }
    this.menuButtonRef = node;
  };

  /**
   * Handles individual menuitem refs. We assign them to a class instance
   * property so that we can properly manage focus of our children.
   */
  handleItemRef = index => node => {
    this.items[index] = node;
  };

  handleMenuClose = event => {
    // Handle ESC keydown for closing the expanded menu.
    if (matches(event, [keys.ESC]) && this.state.expanded) {
      event.stopPropagation();
      event.preventDefault();

      this.setState(() => ({
        expanded: false,
        selectedIndex: null,
      }));

      // Return focus to menu button when the user hits ESC.
      this.menuButtonRef.focus();
      return;
    }
  };

  render() {
    const {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      className: customClassName,
      isMenu,
      children,
      renderMenuContent: MenuContent,
    } = this.props;
    const accessibilityLabel = {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    };
    const className = cx(`${prefix}--header__submenu`, customClassName);
    const parentProps = {
      className: className,
      onKeyDown: this.handleMenuClose,
      onClick: this.handleOnClick,
      onBlur: this.handleOnBlur,
    };
    // Notes on eslint comments and based on the examples in:
    // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-1/menubar-1.html#
    // - The focus is handled by the <a> menuitem, onMouseOver is for mouse
    // users
    // - aria-haspopup can definitely have the value "menu"
    // - aria-expanded is on their example node with role="menuitem"
    // - href can be set to javascript:void(0), ideally this will be a button

    const content = (
      <Fragment>
        <a // eslint-disable-line jsx-a11y/role-supports-aria-props,jsx-a11y/anchor-is-valid
          aria-haspopup="menu" // eslint-disable-line jsx-a11y/aria-proptypes
          aria-expanded={this.state.expanded}
          className={cx(`${prefix}--header__menu-item`, `${prefix}--header__menu-title`)}
          href="javascript:void(0)"
          onKeyDown={this.handleOnKeyDown}
          ref={this.handleMenuButtonRef}
          role="menuitem"
          tabIndex={0}
          aria-label={ariaLabel}
        >
          <MenuContent ariaLabel={ariaLabel} />
        </a>
        <ul {...accessibilityLabel} className={`${prefix}--header__menu`} role="menu">
          {React.Children.map(children, this._renderMenuItem)}
        </ul>
      </Fragment>
    );
    return isMenu ? <li {...parentProps}> {content} </li> : <div {...parentProps}> {content} </div>;
  }

  /**
   * Render an individual menuitem, passing along `role: 'none'` because the
   * host node <li> doesn't apply when in a <ul> with `role="menu"` and so we
   * need to revert the semantics.
   *
   * We also capture the `ref` for each child inside of `this.items` to properly
   * manage focus. In addition to this focus management, all items receive a
   * `tabIndex: -1` so the user won't hit a large number of items in their tab
   * sequence when they might not want to go through all the items.
   */
  _renderMenuItem = (item, index) => {
    return React.cloneElement(item, {
      ref: this.handleItemRef(index),
      role: 'none',
    });
  };
}

export default React.forwardRef((props, ref) => {
  return <HeaderMenu {...props} focusRef={ref} />;
});
