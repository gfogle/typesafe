
module.exports = {
  defineClass: function defineClass(defn) {
    return function classDefn() {
      var instance = {};

      Object.getPrototypeOf(instance).getp = _getp;
      Object.getPrototypeOf(instance).setp = _setp;
      Object.getPrototypeOf(instance).execf = _execf;

      return _defineObjectProp(instance, null, defn);
    };

    /**
     * 
     *  Private functions 
     * 
     */

    function _isArraySyntax(arg) {
      return arg.indexOf('[') !== -1 && arg.indexOf(']') !== -1;
    }

    function _getp(objPath) {
      var paths = objPath.split('.');
      var obj = this;
      var current = obj;

      for(var i = 0; i < paths.length; i++) {
        if (_isArraySyntax(paths[i])) {
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

    function _setp(objPath, value) {
      var paths = objPath.split('.');
      var obj = this;

      for(var i = 0; i < paths.length; i++) {
        var prop;
        var idx;

        if (_isArraySyntax(paths[i]) && i + 1 !== paths.length) {
          prop = paths[i].split('[')[0];
          idx = Number(paths[i].split('[')[1].split(']')[0]);

          obj = obj[prop][idx];
        } else if (_isArraySyntax(paths[i]) && i + 1 === paths.length) {
          prop = paths[i].split('[')[0];
          idx = Number(paths[i].split('[')[1].split(']')[0]);

          if (typeof value !== 'object' || (typeof value === 'object' && Array.isArray(obj[prop]))) {
            obj[prop][idx] = value;
          } else {
            _copyDefined(obj[prop][idx], value);
          }
          break;
        } else if (obj.hasOwnProperty(paths[i]) && i + 1 === paths.length) {
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

    function _execf(fnPath) {
      var paths = fnPath.split('.');
      var obj = this;

      for(var i = 0; i < paths.length; i++) {
        if (_isArraySyntax(paths[i]) && i + 1 !== paths.length) {
          var prop = paths[i].split('[')[0];
          var idx = Number(paths[i].split('[')[1].split(']')[0]);

          obj = obj[prop][idx];
        } else if (obj[paths[i]] && i + 1 === paths.length && typeof obj[paths[i]] === 'function') {
          return obj[paths[i]].apply(obj, arguments);
        } else if (obj.hasOwnProperty(paths[i]) && obj[paths[i]]) {
          obj = obj[paths[i]];
        } else {
          break;
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
      } else if (prop === Number) {
        return 'number';
      } else if (prop === Boolean) {
        return 'boolean';
      } else if (prop === Array) {
        return 'array';
      }
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
      var functions = Object.keys(config.functions || []);

      properties.forEach(function(prop) {
        if (prop !== '__proto__' && typeof config.properties[prop] !== 'object') {
          _defineProp(obj, prop, config.properties[prop]);
        } else if (prop !== '__proto__' && typeof config.properties[prop] === 'object') {
          _defineObjectProp(obj, prop, config.properties[prop]);
        }
      })

      functions.forEach(function(fn) {
        if (typeof config.functions[fn] !== 'function') {
          throw new Error('function definitions must be a function');
        }
        (Object.getPrototypeOf(obj))[fn] = config.functions[fn];
      });

      Object.preventExtensions(obj);

      if (!name) {
        return obj;
      } else {
        instance[name] = obj;
      }
    }
  }
}