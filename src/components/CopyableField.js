import React, { PropTypes, Component } from 'react';
import ZeroClipboard from 'react-zeroclipboard';
import classSet from 'react-classset';

export default class CopyableField extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.state = {
      showPopup: false,
    };
  }

  onCopy(e) {
    const { target } = e;

    this.setState({ showPopup: true });
    setTimeout(() => {
      this.setState({ showPopup: false });
      target.blur();
    }, 1000);
  }

  render() {
    const { value } = this.props;

    const popupClassName = classSet({
      'ui inverted tiny popup top left': true,
      'visible': this.state.showPopup,
    });

    return (
      <div style={{ position: 'relative' }}>
        <div className={ popupClassName } style={{ top: -50, left: 5, right: 'initial' }}>
          Copied!
        </div>
        <div className="ui fluid left action input">
          <ZeroClipboard text={ value }>
            <button className="ui teal left labeled icon button" onClick={ ::this.onCopy }>
              <i className="copy icon"></i>
              Copy
            </button>
          </ZeroClipboard>
          <input value={ value } type="text" readOnly />
        </div>
      </div>
    );
  }
}
