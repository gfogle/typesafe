
module.exports = {
  defineClass: function defineClass(defn) {
    return function classDefn() {
      var instance = {};
      var properties = Object.keys(defn.properties || []);
      var propName;
      var propConfig;

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
          if (typeof value === _type) {
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