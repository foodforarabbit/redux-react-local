'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.$ = $;
exports.setState = setState;
exports.unmount = unmount;
exports.swap = swap;
exports.register = register;
function $(ident) {
  return function (action) {
    var useLocal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    // 'localize' an event. super convenient for making actions 'local' to this component
    return _extends({}, action, {
      type: ident + ':' + action.type,
      meta: _extends({}, action.meta || {}, {
        ident: ident,
        type: action.type,
        local: useLocal
      })
    });
  };
}

function setState(ident) {
  return function (state) {
    return { type: '$$local.setState', payload: { state: state, ident: ident } };
  };
}

function unmount(ident, persist) {
  return function () {
    return {
      type: '$$local.unmount',
      payload: {
        ident: ident,
        persist: persist
      }
    };
  };
}

function swap(ident, reducer, persist, next, initial) {
  return function () {
    return {
      type: '$$local.swap',
      payload: {
        ident: ident,
        next: next,
        initial: initial,
        reducer: reducer,
        persist: persist
      }
    };
  };
}

function register(ident, initial, reducer, persist) {
  return function () {
    return {
      type: '$$local.register',
      payload: {
        ident: ident,
        initial: initial,
        reducer: reducer,
        persist: persist
      }
    };
  };
}