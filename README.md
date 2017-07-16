# typesafe
Typesafe javascript classes

## why type safety?

Javascript is great. It's great for speedy development and minimal overhead for a project. But what it gains in efficiency, it sacrifices in developer sleep. There will be a few error messages below that you'll probably remember seeing; Most likely when Pagerduty was so kind to send you a phone call and text late at night.

But, what if we had a simple model creating library that would lock down objects and make their structure both immutable and type safe? We could essentially define a model like this:

```
const Todo = Typesafe.defineClass({
  properties: [
    {
      name: 'author',
      type: 'object',
      properties: [
        {
          name: 'name',
          type: 'object',
          properties: [
            {
              name: 'first',
              type: 'string'
            },
            {
              name: 'last',
              type: 'string'
            }
          ]
        },
        {
          name: 'age',
          type: 'number'
        }
      ]
    }
  ]
});
```

### Error: cannot call property X on type Y

Typesafe throws an exception if you try to assign a value to a property that has been defined as a different type. For example:
```
  const Todo = Typesafe.defineClass({
    properties: [
      {
        name: 'message',
        type: 'string'
      }
    ]
  });
  let instance = new Todo();

  instance.message = 'should be added';

  try {
    instance.message = 47;
  } catch(e) {}
```
This strategy depends on things like testing your app or code before shipping; especially when dealing with 3rd party APIs. This works since obviously a test would fail when trying to use a String like a Number.

### Error: cannot read property X of undefined?