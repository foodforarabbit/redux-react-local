
import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as T from './tree'
import { getLocalState } from './utils';

const isBrowserLike = typeof navigator !== 'undefined'

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  }
  static childContextTypes = {
    $$local: PropTypes.func,
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
  }
  getChildContext() {
    return {
      $$local: this._local,
      store: this.props.store,
    }
  }

  fns = {}
  _local = (ident, fn) => {
    this.fns[ident] = [ ...this.fns[ident] || [], fn ]
    return () => this.fns[ident] = this.fns[ident].filter(x => x!== fn)
  }
  componentDidMount() {
    if(isBrowserLike) {
      this.dispose = this.props.store.subscribe(() => {
        let state = getLocalState(this.props.store.getState()), changed = false
        T.entries(state.$$changed).forEach(([ key, value ]) => {
          changed = true;
          (this.fns[key] || []).forEach(fn => fn(value))
        })
        if(changed) {
          this.props.store.dispatch({ type: '$$local.flushed' })
        }

      })
    }

  }
  componentWillUnmount() {
    if(this.dispose)  {
      this.dispose()
    }
  }
  render() {
    return this.props.children
  }
}
