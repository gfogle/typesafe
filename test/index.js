const expect = require('chai').expect;
const Typesafe = require('../src/index');

describe('Defining a class', () => {

  it('returns a constructor function whose return value is an object', () => {
    const Todo = Typesafe.defineClass({});

    expect(typeof Todo).to.equal('function');
    expect(typeof (new Todo())).to.equal('object');
  });

  it('seals object to prevent adding new top-level properties', (done) => {
    const Todo = Typesafe.defineClass({});
    let instance = new Todo();

    try {
      instance.newProperty = '';

      expect(Object.keys(instance).length).to.equal(0);
      expect(instance.newProperty).to.equal(undefined);

      done();
    } catch(e) { done(e); }
  });

  describe('Adding primitive properties', () => {

    it('should add properties on the instance', () => {
      const Todo = Typesafe.defineClass({
        properties: {
          message: String
        }
      });
      let instance = new Todo();

      expect(Object.keys(instance).length).to.equal(1);
      expect(instance.message).to.equal(undefined);

      instance.message = 'should be added';

      expect(instance.message).to.equal('should be added');
      expect(typeof instance.message).to.equal('string');
    });

    it('throws exception. Wont update property if value type is different than definition type', (done) => {
      const Todo = Typesafe.defineClass({
        properties: {
          message: String
        }
      });
      let instance = new Todo();
      instance.message = 'should be added';

      try {
        instance.message = 47;
        done(new Error('should have thrown exception'));
      } catch(e) {
        done();
      }
    });

    describe('Supported Primitive Types', () => {
      
      it('supports String', () => {
        const Todo = Typesafe.defineClass({
          properties: {
            message: String
          }
        });
        let instance = new Todo();
        instance.message = 'should be added';

        expect(instance.message).to.equal('should be added');
      });

      it('supports Number', () => {
        const Todo = Typesafe.defineClass({
          properties: {
            count: Number
          }
        });
        let instance = new Todo();
        instance.count = 33;

        expect(instance.count).to.equal(33);
      });

      it('supports Boolean', () => {
        const Todo = Typesafe.defineClass({
          properties: {
            done: Boolean
          }
        });
        let instance = new Todo();
        instance.done = true;

        expect(instance.done).to.equal(true);
      });

      it('supports Arrays', () => {
        const Todo = Typesafe.defineClass({
          properties: {
            done: Array
          }
        });
        let instance = new Todo();
        instance.done = [{ fake: 'yup'}];

        expect(instance.done.length).to.equal(1);
      });

    });

  });

  describe('Adding basic object properties', () => {

    it('creates an object property on the instance', () => {
      const Todo = Typesafe.defineClass({
        properties: {
          author: {
            properties: {
              firstName: String
            }
          }
        }
      });
      let instance = new Todo();

      instance.author = {
        firstName: 'George'
      };

      expect(instance.author.firstName).to.equal('George');
    });

    it('seals object property to prevent adding new properties', (done) => {
      const Todo = Typesafe.defineClass({
        properties: {
          author: {
            properties: {
              firstName: String
            }
          }
        }
      });
      let instance = new Todo();

      try {
        instance.author.lastName = 'Fogle';

        expect(Object.keys(instance.author).length).to.equal(1);
        expect(instance.author.lastName).to.equal(undefined);

        done();
      } catch(e) { done(e); }
    });

    it('throws exception. Wont update sub property if value type is different than definition type', (done) => {
      const Todo = Typesafe.defineClass({
        properties: {
          author: {
            properties: {
              firstName: String
            }
          }
        }
      });
      let instance = new Todo();

      try {
        instance.author.firstName = 47;

        expect(Object.keys(instance.author).length).to.equal(1);

        done(new Error('should have thrown exception'));
      } catch(e) { done(); }
    });

    it('recurses through object property children', () => {
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

      expect(Object.keys(instance).length).to.equal(1);
      expect(Object.keys(instance)[0]).to.equal('author');

      expect(Object.keys(instance.author).length).to.equal(2);
      expect(Object.keys(instance.author).indexOf('name')).to.not.equal(-1);

      expect(Object.keys(instance.author.name).length).to.equal(2);
      expect(Object.keys(instance.author.name).indexOf('first')).to.not.equal(-1);
      expect(Object.keys(instance.author.name).indexOf('last')).to.not.equal(-1);
    });

  });

  describe('Adding function definitions', () => {

    it('should add top-level functions on the instance', () => {
      const Todo = Typesafe.defineClass({
        properties: {
          status: String
        },
        functions: {
          complete: function() {
            this.status = 'complete';
          }
        }
      });
      let instance = new Todo();

      instance.complete();

      expect(instance.status).to.equal('complete');
    });

    it('should add nested functions on the instance', () => {
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
            },
            functions: {
              getFullName: function() {
                return this.name.first + ' ' + this.name.last;
              }
            }
          }
        }
      });
      let instance = new Todo();

      instance.author.name.first = 'Testing';
      instance.author.name.last = 'This';

      expect(instance.author.getFullName()).to.equal('Testing This');
    });
  })
});


describe('Safely accessing properties', () => {

  it('safely returns top-level primitive property', (done) => {
    const Todo = Typesafe.defineClass({
      properties: {
        done: Boolean
      }
    });
    let instance = new Todo();
    instance.done = true

    try {
      var found = instance.getp('done');

      expect(found).to.equal(true);
      done();
    } catch(e) {
      done(e);
    }
  });

  it('safely returns top-level property', () => {
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

    var auth = instance.getp('author');

    expect(Object.keys(auth).length).to.equal(2);
    expect(Object.keys(auth).indexOf('name')).to.not.equal(-1);

    expect(Object.keys(auth.name).length).to.equal(2);
    expect(Object.keys(auth.name).indexOf('first')).to.not.equal(-1);
    expect(Object.keys(auth.name).indexOf('last')).to.not.equal(-1);
  });

  it('safely returns nested property', () => {
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

    var name = instance.getp('author.name');

    expect(Object.keys(name).length).to.equal(2);
    expect(Object.keys(name).indexOf('first')).to.not.equal(-1);
    expect(Object.keys(name).indexOf('last')).to.not.equal(-1);
  });

  it('safely returns nested property of undefined parent', (done) => {
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

    try {
      var bad = instance.getp('author.dontHave.wontFind');

      expect(bad).to.equal(null);
      done();
    } catch(e) {
      done(e);
    }
  });

  it('safely returns top-level array index', () => {
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

    var first = list.getp('list[0]');

    expect(first).to.not.equal(null);
    expect(Object.keys(first.author).length).to.equal(2);
    expect(Object.keys(first.author).indexOf('name')).to.not.equal(-1);

    expect(Object.keys(first.author.name).length).to.equal(2);
    expect(Object.keys(first.author.name).indexOf('first')).to.not.equal(-1);
    expect(Object.keys(first.author.name).indexOf('last')).to.not.equal(-1);
  });

  it('safely returns top-level array index with nested properties', () => {
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

    expect(name).to.not.equal(null);
    expect(Object.keys(name).length).to.equal(2);
    expect(Object.keys(name).indexOf('first')).to.not.equal(-1);
    expect(Object.keys(name).indexOf('last')).to.not.equal(-1);
  });

});


describe('Safely assigning properties', () => {

  it('safely assigns top-level primitive property', (done) => {
    const Todo = Typesafe.defineClass({
      properties: {
        done: Boolean
      }
    });
    let instance = new Todo();

    try {
      instance.setp('done', true);

      expect(instance.done).to.equal(true);
      done();
    } catch(e) {
      done(e);
    }
  });

  it('safely assigns nested property', (done) => {
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

    try {
      instance.setp('author', {
        name: {
          first: 'fake',
          last: 'fake'
        }
      });

      expect(instance.author.name.first).to.equal('fake');
      expect(instance.author.name.last).to.equal('fake');

      done();
    } catch(e) {
      done(e);
    }
  });

  it('safely assigns nested property of defined parent', (done) => {
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

    try {
      instance.setp('author', { name: { first: '', last: '' } });
      instance.setp('author.name.first', 'fake');
      instance.setp('author.name.last', 'fake');

      expect(instance.author.name.first).to.equal('fake');
      expect(instance.author.name.last).to.equal('fake');
      done();
    } catch(e) {
      done(e);
    }
  });

  it('safely throws when assigning nested property of undefined parent', (done) => {
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

    try {
      instance.setp('author.parent', { first: 'shouldnt', last: 'work' });
      done();
    } catch(e) {
      done(e);
    }
  });

  it('safely assigns top-level array index', () => {
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

    list.setp('list', []);
    list.setp('list[0]', instance);

    const first = list.list[0];

    expect(first).to.not.equal(null);
    expect(Object.keys(first.author).length).to.equal(2);
    expect(Object.keys(first.author).indexOf('name')).to.not.equal(-1);

    expect(Object.keys(first.author.name).length).to.equal(2);
    expect(Object.keys(first.author.name).indexOf('first')).to.not.equal(-1);
    expect(Object.keys(first.author.name).indexOf('last')).to.not.equal(-1);
  });

  it('safely assigns top-level array index with nested properties', () => {
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

    list.setp('list', [instance]);
    list.setp('list[0].author.name.first', 'fake');
    list.setp('list[0].author.name.last', 'fake');

    expect(list.list[0].author.name.first).to.equal('fake');
    expect(list.list[0].author.name.last).to.equal('fake');
  });

});