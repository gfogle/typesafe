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

});