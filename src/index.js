
module.exports = {
  defineClass: function defineClass(defn) {
    return function classDefn() {
      var instance = {};
      var properties = defn.properties || [];

      for(var i = 0; i < properties.length; i++) {
        if (properties[i].type === 'object') {
          _defineObjectProp(instance, properties[i]);
        } else {
          _defineProp(instance, properties[i]);
        }
      }

      return Object.preventExtensions(instance);
    };

    function _defineProp(instance, propConfig) {
      var shadowVal;

      Object.defineProperty(instance, propConfig.name, {
        configurable: false, 
        enumerable: true, 
        get: function() {
          return shadowVal;
        },
        set: function(value) {
          if (typeof value === typeof propConfig.type) {
            shadowVal = value;
          } else {
            throw new Error(
              'Cannot set property ' + propConfig.name + ' ' +
              'with a value of type ' + typeof value + '. ' + 
              'It is defined as type ' + typeof propConfig.type
            );
          }
        }
      });
    }

    function _defineObjectProp(instance, propConfig) {
      var obj = {};
      var properties = propConfig.properties || [];

      for(var i = 0; i < properties.length; i++) {
        if (properties[i].type === 'object') {
          _defineObjectProp(obj, properties[i]);
        } else {
          _defineProp(obj, properties[i]);
        }
      }

      Object.preventExtensions(obj);

      instance[propConfig.name] = obj;
    }
  }
}