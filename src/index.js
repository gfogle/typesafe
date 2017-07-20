
module.exports = {
  defineClass: function defineClass(defn) {
    return function classDefn() {
      var instance = {};
      var properties = Object.keys(defn.properties || []);
      var propName;
      var propConfig;

      _createProtoFns(instance);

      for(var i = 0; i < properties.length; i++) {
        propName = properties[i];
        propConfig = defn.properties[propName];

        if (typeof defn.properties[propName] !== 'object') {
          _defineProp(instance, propName, propConfig);
        }
        if (typeof defn.properties[propName] === 'object') {
          _defineObjectProp(instance, propName, propConfig);
        }
      }

      return Object.preventExtensions(instance);
    };

    /**
     * 
     *  Private functions 
     * 
     */

    function _createProtoFns(obj) {
      obj.__proto__.getp = function(objPath) {
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

      obj.__proto__.setp = function(objPath, value) {
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

            obj[prop][idx] = value;
            break;
          } else if (obj.hasOwnProperty(paths[i]) && i + 1 == paths.length) {
            obj[paths[i]] = value;
            break;
          } else if (obj.hasOwnProperty(paths[i]) && obj[paths[i]]) {
            obj = obj[paths[i]];
          } else {
            break;
          }
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

      for(var i = 0; i < properties.length; i++) {
        propName = properties[i];
        propConfig = config.properties[propName];

        if (typeof config.properties[propName] !== 'object') {
          _defineProp(obj, propName, propConfig);
        }
        if (typeof config.properties[propName] === 'object') {
          _defineObjectProp(obj, propName, propConfig);
        }
      }

      Object.preventExtensions(obj);

      instance[name] = obj;
    }
  }
}