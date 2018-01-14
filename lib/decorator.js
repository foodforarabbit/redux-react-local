'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = local;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var isBrowserLike = typeof navigator !== 'undefined';

function whenUndefined(o, orElse) {
  return o === undefined ? orElse : o;
}

var has = {}.hasOwnProperty;

// modified from gaearon/react-pure-render
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (var i = 0; i < keysA.length; i++) {
    if (!has.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

function getId(props) {
  if (typeof props.ident === 'string') {
    return props.ident;
  }
  return props.ident(props);
}

function getInitial(props) {
  if (typeof props.initial !== 'function') {
    return props.initial;
  }
  return props.initial(props);
}

function local(_ref) {
  var config = _objectWithoutProperties(_ref, []);

  var mapProps = function mapProps(_ref2) {
    var props = _objectWithoutProperties(_ref2, []);

    var _props$config = _extends({}, props, config),
        ident = _props$config.ident,
        _props$config$initial = _props$config.initial,
        initial = _props$config$initial === undefined ? {} : _props$config$initial,
        _props$config$reducer = _props$config.reducer,
        reducer = _props$config$reducer === undefined ? function (x) {
      return x;
    } : _props$config$reducer,
        _props$config$persist = _props$config.persist,
        persist = _props$config$persist === undefined ? true : _props$config$persist,
        rest = _objectWithoutProperties(_props$config, ['ident', 'initial', 'reducer', 'persist']);

    if (!ident) {
      throw new Error('cannot annotate with @local without an ident');
    }

    return _extends({
      ident: ident,
      initial: initial,
      reducer: reducer,
      persist: persist
    }, rest);
  };
  return function (Target) {
    var _class, _temp2;

    return _temp2 = _class = function (_Component) {
      _inherits(ReduxReactLocal, _Component);

      function ReduxReactLocal() {
        var _temp, _this, _ret;

        _classCallCheck(this, ReduxReactLocal);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.mappedProps = mapProps(_this.props), _this.store = _this.context.store, _this.state = function () {
          var id = getId(_this.mappedProps),
              storeState = _this.store.getState();

          if (!storeState.get('local')) {
            throw new Error('did you forget to include the `local` reducer?');
          }
          return {
            id: id,
            value: whenUndefined(storeState.get('local').$get(id), getInitial(_this.mappedProps))
          };
        }(), _this.$ = Actions.$(_this.state.id), _this._setState = function (state) {
          _this.store.dispatch(Actions.setState(_this.state.id)(state));
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      ReduxReactLocal.prototype.componentWillMount = function componentWillMount() {
        var _this2 = this;

        this.store.dispatch(Actions.register(this.state.id, this.state.value, this.mappedProps.reducer, this.mappedProps.persist)());
        if (isBrowserLike) {
          this.dispose = this.context.$$local(this.state.id, function (value) {
            _this2.setState({ value: value });
          });
        }
      };

      ReduxReactLocal.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) || this.state.id !== nextState.id || this.state.value !== nextState.value;
      };

      ReduxReactLocal.prototype.componentWillReceiveProps = function componentWillReceiveProps(next) {
        var nextProps = mapProps(next);
        var id = getId(nextProps);

        if (id !== this.state.id) {
          var init = getInitial(nextProps);
          this.store.dispatch(Actions.swap(this.state.id, this.mappedProps.reducer, this.mappedProps.persist, id, init)());

          this.setState({
            id: id,
            value: whenUndefined(this.store.getState().get('local').$get(id), init)
          });
        }
      };

      ReduxReactLocal.prototype.componentWillUnmount = function componentWillUnmount() {
        this.store.dispatch(Actions.unmount(this.state.id, this.mappedProps.persist)());
        if (this.dispose) {
          this.dispose();
        }
      };

      ReduxReactLocal.prototype.render = function render() {
        return _react2.default.createElement(
          Target,
          _extends({}, this.props, {
            $: this.$,
            ident: this.state.id,
            dispatch: this.store.dispatch,
            state: this.state.value,
            setState: this._setState }),
          this.props.children
        );
      };

      return ReduxReactLocal;
    }(_react.Component), _class.contextTypes = {
      store: _propTypes2.default.shape({
        subscribe: _propTypes2.default.func.isRequired,
        dispatch: _propTypes2.default.func.isRequired,
        getState: _propTypes2.default.func.isRequired
      }),
      $$local: _propTypes2.default.func
    }, _class.displayName = 'local:' + (Target.displayName || Target.name), _temp2;
  };
}