import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import classSet from 'react-classset';

export default class Dropdown extends Component {
  static propTypes = {
    selected: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
    className: PropTypes.string,
  }

  constructor() {
    super();
    this.state = {
      opened: false,
    };
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
  }

  handleGlobalClick(e) {
    if (!$.contains(React.findDOMNode(this), e.target)) {
      this.setState({
        opened: false,
      });
    }
  }

  toggleDropdown() {
    this.setState({
      opened: !this.state.opened,
    });
  }

  select(item) {
    this.props.onSelect(item);
  }

  componentDidMount() {
    $(document.body).on('click', this.handleGlobalClick);
  }

  componentWillUnmount() {
    $(document.body).off('click', this.handleGlobalClick);
  }

  renderItem(item) {
    return (
      <div className="item" onClick={ this.select.bind(this, item) } key={ item }>
        { item }
      </div>
    );
  }

  render() {
    const { selected, items, className } = this.props;
    const { opened } = this.state;

    const dropdownClassName = classSet({
      'ui dropdown': true,
      'active visible': opened,
      [className]: className,
    });

    const menuClassName = classSet({
      'menu': true,
      'transition visible': opened,
    });

    return (
      <div className={ dropdownClassName } onClick={ ::this.toggleDropdown }>
        <div className="text">
          { selected }
        </div>
        <i className="dropdown icon"></i>
        <div className={ menuClassName }>
          { items.map(::this.renderItem) }
        </div>
      </div>
    );
  }
}
