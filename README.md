# typesafe
Typesafe javascript classes

## why type safety?
Javascript is great. It's great for speedy development and minimal overhead for a project. But what it gains in efficiency, it sacrifices in developer sleep. There will be a few error messages below that you'll probably remember seeing; Most likely when Pagerduty was so kind to send you a phone call and text late at night.

But, what if we had a simple model creating library that would lock down objects and make their structure both immutable and type safe? We could essentially define a model like this:

```
const Todo = Typesafe.defineClass({
  properties: {
    author: {
      properties: {
        name: {
          properties: {
            first: String,
            last: String
          }
        }
      }
    },
    age: Number
  }
});
```

### Error: cannot call property X on type Y
Typesafe throws an exception if you try to assign a value to a property that has been defined as a different type. For example:
```
  const Todo = Typesafe.defineClass({
    properties: {
      message: String
    }
  });
  let instance = new Todo();

  instance.message = 'should be added';

  try {
    instance.message = 47;
  } catch(e) {}
```
This strategy depends on things like testing your app or code before shipping; especially when dealing with 3rd party APIs. This works since obviously a test would fail when trying to use a String like a Number.

### Error: cannot read property X of undefined?
Ever had this error on nested properties? Maybe there's a weird case where child properties dont always exist? Typesafe handles this by safely accessing properties. Instead of doing a path, give it a path string and it will recurse down the tree of the object. If at any point it finds an undefined property, it returns null
```
const Todo = Typesafe.defineClass({
  properties: {
    author: {
      properties: {
        name: {
          properties: {
            first: String,
            last: String
          }
        },
        age: Number
      }
    }
  }
});
let instance = new Todo();
var bad = instance.getp('author.dontHave.wontFind');
```
The code above will not throw an error anymore. It will simply return null. This also works with array syntax, albeit a simple version:
```
const Todo = Typesafe.defineClass({
  properties: {
    author: {
      properties: {
        name: {
          properties: {
            first: String,
            last: String
          }
        },
        age: Number
      }
    }
  }
});
const TodoList = Typesafe.defineClass({
  properties: {
    list: Array
  }
});
var instance = new Todo();
let list = new TodoList();

list.list = [instance];

var name = list.getp('list[0].author.name');
```

### Defining Functions
Ok. but what if we want functions on the objects we create? Well, we can further define our class with a `functions` property:
```
const Todo = Typesafe.defineClass({
  properties: {
    done: Boolean,
    author: {
      properties: {
        name: {
          properties: {
            first: String,
            last: String
          }
        },
        age: Number
      },
      functions: {
        getFullName: function() {
          return this.name.first + ' ' + this.name.last;
        }
      }
    }
  },
  functions: {
    isDone: function() {
      return this.done === true;
    }
  }
});
let instance = new Todo();
```
This might seem a little more work defining `functions` and `properties` but it makes for a consistent syntax and will allow us to do some more complex runtime analysis going forward that you may find useful.

### Error: cannot call X on object Y as it is not a Function

Sometimes we miskey something, or a function doesnt exist on a sub-property. Though, this really shouldnt happen since you'd have caught that in development, but occasionally it does. We can mitigate this by using a safe execution function `execf` which takes a path string and if it is a function will execute it:
```
instance.execf('author.getFullName')
```