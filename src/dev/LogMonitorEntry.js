import React, { PropTypes } from 'react';

function preStyles() {
  return {
    overflowX: 'scroll',
    overflowWrap: 'normal',
  };
}

function prettyJSON(o) {
  return JSON.stringify(o, null, 2);
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const mod = i % 6;
  const r = [v, q, p, p, t, v][mod];
  const g = [t, v, v, q, p, p][mod];
  const b = [p, p, t, v, v, q][mod];

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function colorFromString(token) {
  const splitToken = token.split('');
  const finalToken = splitToken.concat(splitToken.reverse());

  const number = finalToken.reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  ) * Math.abs(Math.sin(token.length));

  const h = Math.round((number * (180 / Math.PI) * token.length) % 360);
  const s = number % 100 / 100;
  const v = 1;

  return hsvToRgb(h, s, v);
}

export default class LogMonitorEntry {
  static propTypes = {
    index: PropTypes.number.isRequired,
    state: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,
    select: PropTypes.func.isRequired,
    error: PropTypes.string,
    onActionClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool,
  };

  printState(state, error) {
    let errorText = error;
    if (!errorText) {
      try {
        return <pre style={preStyles()}>{prettyJSON(this.props.select(state))}</pre>;
      } catch (err) {
        errorText = 'Error selecting state.';
      }
    }

    return (
      <span style={{
        fontStyle: 'italic',
      }}>
        ({errorText})
      </span>
    );
  }

  handleActionClick() {
    const { index, onActionClick } = this.props;
    if (index > 0) {
      onActionClick(index);
    }
  }

  render() {
    const { index, error, action, state, collapsed } = this.props;
    const { r, g, b } = colorFromString(action.type);

    return (
      <div style={{
        textDecoration: collapsed ? 'line-through' : 'none',
      }}>
        <a onClick={::this.handleActionClick}
           style={{
             opacity: collapsed ? 0.5 : 1,
             marginTop: '1em',
             display: 'block',
             paddingBottom: '1em',
             paddingTop: '1em',
             cursor: (index > 0) ? 'hand' : 'default',
             WebkitUserSelect: 'none',
           }}>
          <pre style={Object.assign(preStyles(), {backgroundColor: `rgb(${r}, ${g}, ${b})`})}>
            {prettyJSON(action)}
          </pre>
        </a>

        {!collapsed &&
          <p style={{
            textAlign: 'center',
            transform: 'rotate(180deg)',
          }}>
            ⇧
          </p>
        }

        {!collapsed &&
          <div style={{
            paddingBottom: '1em',
            paddingTop: '1em',
            color: 'lightyellow',
          }}>
            {this.printState(state, error)}
          </div>
        }

        <hr style={{
          marginBottom: '2em',
        }} />
      </div>
    );
  }
}
