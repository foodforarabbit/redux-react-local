import React, { PropTypes, Component } from 'react' // eslint-disable-line no-unsafe-negation, no-global-assign
import * as Actions from './actions'

const isBrowserLike = typeof navigator !== 'undefined'

function whenUndefined(o, orElse) {
  return o === undefined ? orElse : o
}

const has = {}.hasOwnProperty

// modified from gaearon/react-pure-render
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!objB::has(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

function getId(props) {
  if (typeof props.ident === 'string') {
    return props.ident
  }
  return props.ident(props)
}

function getInitial(props) {
  if (typeof props.initial !== 'function') {
    return props.initial
  }
  return props.initial(props)
}

export default function local({ ...config }) {
  const mapProps = (props) => {
    const {
      ident,            // string / ƒ(props)
      initial = {},     // value / ƒ(props)
      reducer = x => x, // ƒ(state, action) => state
      persist = true,    // can swap out state on unmount
      ...rest
    } = { ...props, ...config }

    if (!ident) {
      throw new Error('cannot annotate with @local without an ident')
    }

    return {
      ident,
      initial,
      reducer,
      persist,
      ...rest
    }
  }
  return function (Target) {
    return class ReduxReactLocal extends Component {

      static contextTypes = {
        store: PropTypes.shape({
          subscribe: PropTypes.func.isRequired,
          dispatch: PropTypes.func.isRequired,
          getState: PropTypes.func.isRequired
        }),
        $$local: PropTypes.func
      }
      static displayName = 'local:' + (Target.displayName || Target.name)

      mappedProps = mapProps(this.props);

      store = this.context.store

      state = (() => {
        let id = getId(this.mappedProps),
          storeState = this.store.getState()

        if(!storeState.get('local')) {
          throw new Error('did you forget to include the `local` reducer?')
        }
        return {
          id,
          value: whenUndefined(storeState.get('local').$get(id), getInitial(this.mappedProps))
        }
      })()

      $ = Actions.$(this.state.id)

      _setState = state => {
        this.store.dispatch(Actions.setState(this.state.id)(state))
      }

      componentWillMount() {
        this.store.dispatch(Actions.register(this.state.id, this.state.value, this.mappedProps.reducer, this.mappedProps.persist)())
        if(isBrowserLike) {
          this.dispose = this.context.$$local(this.state.id, value => {
            this.setState({ value })
          })
        }
      }
      shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.mappedProps, mapProps(nextProps)) ||
          (this.state.id !== nextState.id) ||
          (this.state.value !== nextState.value)
      }

      componentWillReceiveProps(next) {
        let id = getId(next)

        if (id !== this.state.id) {
          let init = getInitial(next)
          this.store.dispatch(
            Actions.swap(this.state.id, this.mappedProps.reducer, this.mappedProps.persist, id, init)()
          )

          this.setState({
            id,
            value: whenUndefined(this.store.getState().get('local').$get(id), init)
          })
        }
      }

      componentWillUnmount() {
        this.store.dispatch(
          Actions.unmount(this.state.id, this.mappedProps.persist)()
        )
        if(this.dispose) {
          this.dispose()
        }
      }

      render() {
        return <Target
          {...this.mappedProps}
          $={this.$}
          ident={this.state.id}
          dispatch={this.store.dispatch}
          state={this.state.value}
          setState={this._setState}>
            {this.mappedProps.children}
        </Target>
      }
    }
  }

}
