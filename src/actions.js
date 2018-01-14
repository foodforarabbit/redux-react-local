

export function $(ident) {
  return (action, useLocal = true) => {
    // 'localize' an event. super convenient for making actions 'local' to this component
    return  {
      ...action,
      type: `${ident}:${action.type}`,
      meta: {
        ...action.meta || {},
        ident,
        type: action.type,
        local: useLocal
      }
    }
  }
}

export function setState(ident) {
  return (state) => {
    return { type: '$$local.setState', payload: { state, ident } }
  }
}

export function unmount(ident, persist) {
  return () => {
    return {
      type: '$$local.unmount',
      payload: {
        ident,
        persist
      }
    }
  }
}

export function swap(ident, reducer, persist, next, initial) {
  return () => {
    return {
      type: '$$local.swap',
      payload: {
        ident,
        next,
        initial,
        reducer,
        persist
      }
    }
  }
}

export function register(ident, initial, reducer, persist) {
  return () => {
    return {
      type: '$$local.register',
      payload: {
        ident,
        initial,
        reducer,
        persist
      }
    }
  }
}
