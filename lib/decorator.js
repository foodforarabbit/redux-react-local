'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = local;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

function local() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      ident = _ref.ident,
      _ref$initial = _ref.initial,
      initial = _ref$initial === undefined ? {} : _ref$initial,
      _ref$reducer = _ref.reducer,
      reducer = _ref$reducer === undefined ? function (x) {
    return x;
  } : _ref$reducer,
      _ref$persist = _ref.persist,
      persist = _ref$persist === undefined ? true : _ref$persist;

  if (!ident) {
    throw new Error('cannot annotate with @local without an ident');
  }

  // if (!initial) {
  //   throw new Error('cannot annotate with @local without an initial state')
  // }

  function getId(props) {
    if (typeof ident === 'string') {
      return ident;
    }
    return ident(props);
  }

  function getInitial(props) {
    if (typeof initial !== 'function') {
      return initial;
    }
    return initial(props);
  }

  return function (Target) {
    var _class, _temp2;

    return _temp2 = _class = function (_Component) {
      _inherits(ReduxReactLocal, _Component);

      function ReduxReactLocal() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, ReduxReactLocal);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = ReduxReactLocal.__proto__ || Object.getPrototypeOf(ReduxReactLocal)).call.apply(_ref2, [this].concat(args))), _this), _this.store = _this.context.store, _this.state = function () {
          var id = getId(_this.props),
              storeState = _this.store.getState();

          if (!storeState.get('local')) {
            throw new Error('did you forget to include the `local` reducer?');
          }
          return {
            id: id,
            value: whenUndefined(storeState.get('local').$get(id), getInitial(_this.props))
          };
        }(), _this.$ = Actions.$(_this.state.id), _this._setState = function (state) {
          _this.store.dispatch(Actions.setState(_this.state.id)(state));
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(ReduxReactLocal, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var _this2 = this;

          this.store.dispatch(Actions.register(this.state.id, this.state.value, reducer, persist)());
          if (isBrowserLike) {
            this.dispose = this.context.$$local(this.state.id, function (value) {
              _this2.setState({ value: value });
            });
          }
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          return !shallowEqual(this.props, nextProps) || this.state.id !== nextState.id || this.state.value !== nextState.value;
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
          var id = getId(next);

          if (id !== this.state.id) {
            var init = getInitial(next);
            this.store.dispatch(Actions.swap(this.state.id, reducer, persist, id, init)());

            this.setState({
              id: id,
              value: whenUndefined(this.store.getState().get('local').$get(id), init)
            });
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.store.dispatch(Actions.unmount(this.state.id, persist)());
          if (this.dispose) {
            this.dispose();
          }
        }
      }, {
        key: 'render',
        value: function render() {
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
        }
      }]);

      return ReduxReactLocal;
    }(_react.Component), _class.contextTypes = {
      store: _react.PropTypes.shape({
        subscribe: _react.PropTypes.func.isRequired,
        dispatch: _react.PropTypes.func.isRequired,
        getState: _react.PropTypes.func.isRequired
      }),
      $$local: _react.PropTypes.func
    }, _class.displayName = 'local:' + (Target.displayName || Target.name), _temp2;
  };
}