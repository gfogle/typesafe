
module.exports = {
  defineClass: function defineClass(defn) {
    return function classDefn() {
      var instance = {};
      var properties = Object.keys(defn.properties || []);
      var propName;
      var propConfig;
      var functions = Object.keys(defn.functions || []);
      var fnName;
      var fnDefn;

      _createProtoFns(instance);

      for(var i = 0; i < properties.length; i++) {
        propName = properties[i];
        propConfig = defn.properties[propName];

        if (propName === '__proto__') {
          continue;
        }

        if (typeof defn.properties[propName] !== 'object') {
          _defineProp(instance, propName, propConfig);
        }
        if (typeof defn.properties[propName] === 'object') {
          _defineObjectProp(instance, propName, propConfig);
        }
      }

      for(var j = 0; j < functions.length; j++) {
        fnName = functions[j];
        fnDefn = defn.functions[fnName];

        if (typeof fnDefn !== 'function') {
          throw new Error('function definitions must be functions');
          break;
        }

        _defineFunction(instance, fnName, fnDefn);
      }

      return Object.preventExtensions(instance);
    };

    /**
     * 
     *  Private functions 
     * 
     */

    function _createProtoFns(obj) {
      var proto = Object.getPrototypeOf(obj);

      proto.getp = function(objPath) {
        var paths = objPath.split('.');
        var obj = this;
        var current = obj;

        for(var i = 0; i < paths.length; i++) {
          if (paths[i].indexOf('[') !== -1 && paths[i].indexOf(']') !== -1) {
            var prop = paths[i].split('[')[0];
            var idx = Number(paths[i].split('[')[1].split(']')[0]);

            current = current[prop][idx];
          } else if (current[paths[i]]) {
            current = current[paths[i]];
          } else {
            current = null;
            break;
          }
        }

        return current ? current : null;
      }

      proto.setp = function(objPath, value) {
        var paths = objPath.split('.');
        var obj = this;

        for(var i = 0; i < paths.length; i++) {
          if (paths[i].indexOf('[') !== -1 && paths[i].indexOf(']') !== -1 && i + 1 !== paths.length) {
            var prop = paths[i].split('[')[0];
            var idx = Number(paths[i].split('[')[1].split(']')[0]);

            obj = obj[prop][idx];
          } else if (paths[i].indexOf('[') !== -1 && paths[i].indexOf(']') !== -1 && i + 1 === paths.length) {
            var prop = paths[i].split('[')[0];
            var idx = Number(paths[i].split('[')[1].split(']')[0]);

            if (typeof value !== 'object' || (typeof value === 'object' && Array.isArray(obj[prop]))) {
              obj[prop][idx] = value;
            } else {
              _copyDefined(obj[prop][idx], value);
            }
            break;
          } else if (obj.hasOwnProperty(paths[i]) && i + 1 == paths.length) {
            if (typeof value !== 'object' || (typeof value === 'object' && Array.isArray(value))) {
              obj[paths[i]] = value;
            } else {
              _copyDefined(obj[paths[i]], value);
            }
            break;
          } else if (obj.hasOwnProperty(paths[i]) && obj[paths[i]]) {
            obj = obj[paths[i]];
          } else {
            break;
          }
        }
      }

      proto.execf = function(fnPath) {
        var paths = fnPath.split('.');
        var obj = this;

        for(var i = 0; i < paths.length; i++) {
          if (paths[i].indexOf('[') !== -1 && paths[i].indexOf(']') !== -1 && i + 1 !== paths.length) {
            var prop = paths[i].split('[')[0];
            var idx = Number(paths[i].split('[')[1].split(']')[0]);

            obj = obj[prop][idx];
          } else if (obj[paths[i]] && i + 1 == paths.length && typeof obj[paths[i]] === 'function') {
            return obj[paths[i]].apply(obj, arguments);
          } else if (obj.hasOwnProperty(paths[i]) && obj[paths[i]]) {
            obj = obj[paths[i]];
          } else {
            break;
          }
        }
      }
    }

    function _copyDefined(defined, given) {
      var definedProps = Object.keys(defined);

      for(var i = 0; i < definedProps.length; i++) {
        if (typeof defined[definedProps[i]] !== 'object' && given[definedProps[i]]) {
          defined[definedProps[i]] = given[definedProps[i]];
        } else if (typeof defined[definedProps[i]] === 'object' && given[definedProps[i]] && typeof given[definedProps[i]] === 'object') {
          _copyDefined(defined[definedProps[i]], given[definedProps[i]])
        }
      }     
    }

    function _determineType(prop) {
      if (prop === String) {
        return 'string';
      }
      if (prop === Number) {
        return 'number';
      }
      if (prop === Boolean) {
        return 'boolean';
      }
      if (prop === Array) {
        return 'array';
      }
    }

    function _defineFunction(instance, name, fn) {
      (Object.getPrototypeOf(instance))[name] = fn;
    }

    function _defineProp(instance, name, config) {
      var shadowVal;
      var _type = _determineType(config);

      Object.defineProperty(instance, name, {
        configurable: false, 
        enumerable: true, 
        get: function() {
          return shadowVal;
        },
        set: function(value) {
          if (Array.isArray(value) && _type === 'array') {
            shadowVal = value;
          } else if (typeof value === _type) {
            shadowVal = value;
          } else {
            throw new Error(
              'Cannot set property ' + name + ' ' +
              'with a value of type ' + typeof value + '. ' + 
              'It is defined as type ' + _type
            );
          }
        }
      });
    }

    function _defineObjectProp(instance, name, config) {
      var obj = {};
      var properties = Object.keys(config.properties || []);
      var propName;
      var propConfig;
      var functions = Object.keys(config.functions || []);
      var fnName;
      var fnDefn;

      for(var i = 0; i < properties.length; i++) {
        propName = properties[i];
        propConfig = config.properties[propName];

        if (propName === '__proto__') {
          continue;
        }
        
        if (typeof config.properties[propName] !== 'object') {
          _defineProp(obj, propName, propConfig);
        }
        if (typeof config.properties[propName] === 'object') {
          _defineObjectProp(obj, propName, propConfig);
        }
      }

      for(var j = 0; j < functions.length; j++) {
        fnName = functions[j];
        fnDefn = config.functions[fnName];

        if (typeof fnDefn !== 'function') {
          throw new Error('function definitions must be functions');
          break;
        }

        _defineFunction(obj, fnName, fnDefn);
      }

      Object.preventExtensions(obj);

      instance[name] = obj;
    }
  }
}