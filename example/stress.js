
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { render } from 'react-dom'
import { local } from '../src'
import Root from './root'

import styles from './stress.css'

@local({
  ident: ({ id }) => `cell:${id}`,
  initial: () => Math.random(),
  reducer(state, { me, meta } = {}) {
    if(me && meta.type === 'tick') {
      return Math.random()
    }
    return state
  }
})
class Cell extends Component {
  static propTypes = {
    period: PropTypes.number.isRequired
  }
  state = {
    value: Math.random()
  }
  componentDidMount() {
    setInterval(() => this.props.dispatch(this.props.$({ type: 'tick' })), this.props.period)
    // setInterval(() => this.props.setState(Math.random()), this.props.period)
    // setInterval(() => this.setState({ value: Math.random() }), this.props.period)
  }
  render() {
    return <div className={styles.cell} style={{ opacity: this.props.state }}/>
    // return <div className={styles.cell} style={{ opacity: this.state.value }}/>


  }
}

function times(n, fn) {
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(fn(i))
  }
  return arr
}

class App extends Component {
  render() {
    return <div onClick={this.onClick}>
      {times(6000, i => <Cell period={Math.random() * 10000} id={i} key={i} />)}
    </div>
  }
}

// console.profile()
render(<Root><App /></Root>, document.getElementById('app'))
// console.profileEnd()