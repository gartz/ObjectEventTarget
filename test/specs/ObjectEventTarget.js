/*globals describe, it, expect, beforeEach*/
describe('ObjectEventTarget should', function() {
  /*globals ObjectEvent, ObjectEventTarget*/

  var Emitter;
  var events = {};

  beforeEach(function() {
    Emitter = Object.create(ObjectEventTarget.prototype);
    events.normal = new ObjectEvent('test');
    events.cancelable = new ObjectEvent('test', {cancelable: true});
  });
 

  it('be available on global scope', function() {
    expect(ObjectEventTarget).toBeDefined();
  });

  it('throw an error if not using "new" operator', function() {
    expect(ObjectEventTarget).toThrow();
  });

  it('dispatch events in sequence', function(){
    var order = 0;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(1);
      },
      second: function(){
        order++;
        expect(order).toBe(2);
      },
      third: function(){
        order++;
        expect(order).toBe(3);
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.dispatchEvent(events.normal);

    expect(order).toBe(3);
  });

  it('dispatch events more than once in sequence', function(){
    var order = 0;
    var result = 0;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(result + 1);
      },
      second: function(){
        order++;
        expect(order).toBe(result + 2);
      },
      third: function(){
        order++;
        expect(order).toBe(result + 3);
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.dispatchEvent(events.normal);
    expect(order).toBe(3);
    result = 3;
    Emitter.dispatchEvent(events.cancelable);
    expect(order).toBe(6);
  });

  it('allow to remove events and keep the sequence of callbacks', function(){
    var order = 0;
    var result = 0;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(result + 1);
      },
      second: function(){
        order++;
        expect(order).toBe(result + 2);
      },
      third: function(){
        order++;
        expect(order).toBe(result + 3);
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.removeEventListener('test', callbacks.third);

    Emitter.dispatchEvent(events.normal);
    expect(order).toBe(2);
    order = 4;

    Emitter.removeEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.third);

    result = 3;
    Emitter.dispatchEvent(events.cancelable);
    expect(order).toBe(6);
  });

  it('allow to stopImmediatePropagation and not execute the events after', function(){
    var order = 0;
    var result = 0;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(result + 1);
      },
      second: function(event){
        event.stopImmediatePropagation();
        order++;
        expect(order).toBe(result + 2);
      },
      third: function(){
        order++;
        expect(order).toBe(result + 2); // run only if second doesn't exist
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.dispatchEvent(events.normal);
    expect(order).toBe(2);
  });

  it('allow to stopImmediatePropagation to be removed, executing the events after', function(){
    var order = 0;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(1);
        order = 3;
      },
      second: function(event){
        event.stopImmediatePropagation();
        order++;
        expect(order).toBe(2);
      },
      third: function(){
        expect(order).toBe(3); // run only if second doesn't exist
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.removeEventListener('test', callbacks.second);

    Emitter.dispatchEvent(events.normal);
    expect(order).toBe(3);
  });

  it('respect the type of events and sequence of dispatchs', function(){
    var order = 0;
    var result = 0;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(result + 1);
      },
      second: function(){
        order++;
        expect(order).toBe(result + 2);
      },
      third: function(){
        order++;
        expect(order).toBe(result + 3);
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.addEventListener('test2', callbacks.first);
    Emitter.addEventListener('test2', callbacks.second);
    Emitter.addEventListener('test2', callbacks.third);

    Emitter.dispatchEvent(new ObjectEvent('test2'));
    expect(order).toBe(3);
    result = 3;

    Emitter.dispatchEvent(events.normal);
    expect(order).toBe(6);
  });

  it('do a stopImmediatePropagation when a callback throw an error', function(done){
    var order = 0;
    var confirm = false;
    var callbacks = {
      first: function(){
        order++;
        expect(order).toBe(1);
      },
      second: function(){
        order++;
        expect(order).toBe(2);
        throw new Error('fail');
      },
      third: function(){
        order++;
        expect(order).toBe(3);
        confirm = true;
      }
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);
    Emitter.dispatchEvent(events.normal);
    expect(order).toBe(2);
    expect(confirm).toBe(false);

    setTimeout(done,10);
  });

  it('return true on dispatchEvent when has no listeners', function(){
    expect(Emitter.dispatchEvent(events.normal)).toBe(true);
  });

  it('return true on dispatchEvent when all listeners has been removed', function(){
    var callbacks = {
      first: function(){},
      second: function(){},
      third: function(){}
    };

    Emitter.addEventListener('test', callbacks.first);
    Emitter.addEventListener('test', callbacks.second);
    Emitter.addEventListener('test', callbacks.third);

    Emitter.removeEventListener('test', callbacks.first);
    Emitter.removeEventListener('test', callbacks.second);
    Emitter.removeEventListener('test', callbacks.third);

    expect(Emitter.dispatchEvent(events.normal)).toBe(true);
  });

  describe('allow to remove listeners that', function(){
    it('doesn\'t exist', function(){
      var callbacks = {
        first: function(){},
        second: function(){},
        third: function(){}
      };

      Emitter.removeEventListener('test', callbacks.first);
      Emitter.removeEventListener('test', callbacks.second);
      Emitter.removeEventListener('test', callbacks.third);

      expect(Emitter.dispatchEvent(events.normal)).toBe(true);
    });


    it('doesn\'t exist in a instance with other event type', function(){
      var callbacks = {
        first: function(){},
        second: function(){}
      };

      Emitter.addEventListener('test', callbacks.first);
      Emitter.removeEventListener('test2', callbacks.second);

      expect(Emitter.dispatchEvent(events.normal)).toBe(true);
    });

    it('doesn\'t exist in a instance with other event of same type', function(){
      var callbacks = {
        first: function(){},
        second: function(){}
      };

      Emitter.addEventListener('test', callbacks.first);
      Emitter.removeEventListener('test', callbacks.second);

      expect(Emitter.dispatchEvent(events.normal)).toBe(true);
    });
  });
});
