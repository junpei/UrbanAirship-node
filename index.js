var url = require('url');
var base64 = require('base64');

/**
 * UrbanAirship
 *
 * UrbanAirship APIを利用するクラス
 *
 * @param options
 *   url
 *   applicationKey
 *   applicationSecret
 *   applicationMasterSecret
 * @return this
 * @author KITA, Junpei
 */
var UrbanAirship = module.exports = function (options) {
  this.options = options || {};

  this._url = url.parse(this.options.url || 'https://go.urbanairship.com');
  this._applicationKey          = this.options.applicationKey          || null;
  this._applicationSecret       = this.options.applicationSecret       || null;
  this._applicationMasterSecret = this.options.applicationMasterSecret || null;

  if (this._applicationKey === null)
    throw new Error('applicationKey not found.');

  if (this._applicationSecret === null)
    throw new Error('applicationSecret not found.');

  if (this._applicationMasterSecret === null)
    throw new Error('applicationMasterSecret not found.');

  this._client = this._url.protocol === 'http:' ? require('http') : require('https');
};

/**
 * UrbanAirship.prototype.register()
 *
 * UrbanAirshipへのデバイス登録メソッド
 *
 * @param params
 *   device_token 'string' // c2dm_registration_idとどちらかのみ
 *   c2dm_registration_id 'string' // device_tokenとどちらかのみ
 *   alias 'string'
 *   tags ['string']
 *   badge number // iPhoneのみ
 *   quiettime { start : 'hh:mm', end : 'hh:mm' } // iPhoneのみ
 *   tz 'Japan/Tokyo' // iPhoneのみ
 * @see http://urbanairship.com/docs/push.html#registration
 * @see http://urbanairship.com/docs/android.html#registration
 * @return
 */
UrbanAirship.prototype.register = function (params) {
  var p = params || {};

  if (typeof p !== 'object' ||
      Array.isArray(p) !== false)
    throw new Error('arguments[0] is invalid.');

  else if (p.device_token && p.c2dm_registration_id)
    throw new Error('device_token and c2dm_registration_id can not together.');

  else if (p.device_token) {
    this._url.pathname = '/api/device_tokens/' + p.device_token;
    delete p.device_token;
  }

  else if (p.c2dm_registration_id) {
    this._url.pathname = '/api/apids/' + p.c2dm_registration_id;
    delete p.c2dm_registration_id;
  }

  else
    throw new Error('device_token or c2dm_registration_id not found.');

  var body = body.stringify(p);
  var req = this._client.request(
      this._requestOptions({
        method : 'PUT',
        headers : { 'content-lehgth' : body.length }
      }),
      function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error(res);
        }
      });

  req.on('error', function (e) {
    throw new Error(e);
  });

  req.write(body);
  req.end();
};

/**
 * UrbanAirship.prototype.deregister()
 *
 * UrbanAirshipへのデバイス削除メソッド
 *
 * @param params
 *   device_token 'string' // c2dm_registration_idとどちらかのみ
 *   c2dm_registration_id 'string' // device_tokenとどちらかのみ
 * @see http://urbanairship.com/docs/push.html#registration
 * @see http://urbanairship.com/docs/android.html#registration
 * @return
 */
UrbanAirship.prototype.deregister = function (params) {
  var p = params = {};

  if (typeof p !== 'object' ||
      Array.isArray(p) !== false)
    throw new Error('arguments[0] is invalid.');

  else if (p.device_token && p.c2dm_registration_id)
    throw new Error('device_token and c2dm_registration_id can not together.');

  else if (p.device_token) {
    this._url.pathname = '/api/device_tokens/' + p.device_token;
    delete p.device_token;
  }

  else if (p.c2dm_registration_id) {
    this._url.pathname = '/api/apids/' + p.c2dm_registration_id;
    delete p.c2dm_registration_id;
  }

  else
    throw new Error('device_token or c2dm_registration_id not found.');

  var req = this._client.request(
      this._requestOptions({ method : 'DELETE' }),
      function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error(res);
        }
      });

  req.on('error', function (e) {
    throw new Error(e);
  });

  req.end();
};

/**
 * UrbanAirship.prototype.push()
 *
 * デバイスへのpushメソッド
 *
 * @param params
 *   device_tokens : ['string'],
 *   apids : ['string'],
 *   aliases : ['string'],
 *   tags : ['string'],
 *   alert : 'string',
 *   sound : 'string',
 *   badge : number || '+number',
 *   extra : { 'string' : 'string' }
 *
 * @see http://urbanairship.com/docs/push.html#push
 * @see http://urbanairship.com/docs/android.html#push
 * @return
 */
UrbanAirship.prototype.push = function (params) {
  var p = params || {};

  if (typeof p !== 'object' ||
      Array.isArray(p) !== false)
    throw new Error('arguments[0] is invalid.');

  var aps = {
    sound : p.sound || 'default',
    badge : p.badge || 'auto',
    alert : p.alert || ''
  };
  var android = {
    extra : p.extra || {},
    alert : p.alert || ''
  };

  delete p.alert;
  delete p.sound;
  delete p.badge;
  delete p.extra;

  Object.defineProperty(p, 'extend', {
    enumerable : false,
    value : function (options) {
      var clone = options || {};
      for (var key in this) {
        clone[key] = clone[key] || this[key];
      }
      return clone;
    }
  });

  var that = this;
  var push = function (body) {
    var req = that._client.request(
        that._requestOptions({
          method : 'POST',
          path : '/api/push/',
          headers : { 'content-length' : body.length }
        }),
        function (res) {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            console.error(res);
          }
        }
        );

    req.on('error', function (e) {
      throw new Error(e);
    });

    req.write(body);
    req.end();
  };

  if (p.device_tokens && Array.isArray(p.device_tokens)) {
    var _p = p.extend({ aps : aps });

    aps = undefined;
    delete _p.apids;

    push(JSON.stringify(_p));
  }

  if (p.apids && Array.isArray(p.apids)) {
    var _p = p.extend({ android : android });

    android = undefined;
    delete _p.device_tokens;

    push(JSON.stringify(_p));
  }

  if (aps && android) {
    p.aps = aps;
    p.android = android;
    push(JSON.stringify(p))
  }
};

/**
 * UrbanAirship.prototype.broadcast()
 *
 * デバイスへのbroadcastメソッド
 *
 * @param params
 *   alert : 'string',
 *   sound : 'string',
 *   badge : number || '+number',
 *   extra : { 'string' : 'string' }
 *
 * @see http://urbanairship.com/docs/push.html#broadcast
 * @see http://urbanairship.com/docs/android.html#broadcast
 * @return
 */
UrbanAirship.prototype.broadcast = function (params) {
  var p = params || {};

  if (typeof p !== 'object' ||
      Array.isArray(p) !== false)
    throw new Error('arguments[0] is invalid.');

  p.aps = {
    sound : p.sound || null,
    badge : p.badge || '+1',
    alert : p.alert || ''
  };
  p.android = {
    extra : p.extra || {},
    alert : p.alert || ''
  };

  delete p.alert;
  delete p.sound;
  delete p.badge;
  delete p.extra;

  var body = JSON.stringify(p);
  var req = this._client.request(
      this._requestOptions({
        method : 'POST',
        path : '/api/push/broadcast/',
        headers : { 'content-length' : body.length }
      }),
      function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error(res);
        }
      }
      );

  req.on('error', function (e) {
    throw new Error(e);
  });

  req.write(body);
  req.end();
};

/**
 * private
 */
UrbanAirship.prototype._requestOptions = function (options) {
  var o = options || {};

  o.method = o.method || 'GET';
  o.host = o.host || this._url.host;
  o.port = o.port || (this._url.protocol === 'http:' ? 80 : 443);
  o.path = o.path || this._url.pathname;

  o.headers = o.headers || {};
  o.headers['content-type'] = o.headers['content-type'] || 'application/json';
  o.headers['content-length'] = o.headers['content-length'] || 0;
  o.headers['authorization'] = o.headers['authorization'] ||
    'Basic ' + base64.encode(
        this._applicationKey + ':' + this._applicationMasterSecret);

  return o;
};
