/*globals ObjectEvent, ObjectEventTarget*/
describe('ObjectEvent should', function() {

  var Emitter;

  beforeEach(function() {
    Emitter = Object.create(ObjectEventTarget.prototype);
  });
 

  it('be available on global scope', function() {
    expect(ObjectEvent).toBeDefined();
  });

  it('throw an error if not using "new" operator', function() {
    expect(ObjectEvent).toThrow();
  });

  it('throw an error if construct with no arguments', function(){
    var result;
    try{
      new ObjectEvent();
      result = function(){};
    } catch(e){
      result = function(){
        throw e;
      };
    }
    expect(result).toThrow();
  });

  it('allow any value that can be parsed to a string as type parameter', function(){
    expect(new ObjectEvent('')).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent('a')).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent(0)).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent(1)).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent(null)).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent(undefined)).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent(true)).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent(false)).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent({})).toEqual(jasmine.any(ObjectEvent));
    expect(new ObjectEvent([])).toEqual(jasmine.any(ObjectEvent));
  });

  it('allow add detail property in the seccond param object', function(){
    var myObject = {};
    var event = new ObjectEvent('', { detail: myObject });
    expect(event).toEqual(jasmine.any(ObjectEvent));
    expect(event.detail).toBe(myObject);
  });

  describe('be ran ïnitEvent"', function(){
    it('when dispatching a event', function(){
      // Code coverage workaround:
      var event = new ObjectEvent('test');
      Emitter.dispatchEvent(event);

      // Now spy for testing:
      spyOn(ObjectEvent.prototype, 'initEvent');
      event = new ObjectEvent('test');
      Emitter.dispatchEvent(event);

      expect(ObjectEvent.prototype.initEvent).toHaveBeenCalled();
    });

    it('even when it\'s a native event', function(){
      // Code coverage workaround:
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('test', false, false, null);
      Emitter.dispatchEvent(event);

      // Now spy for testing:
      spyOn(ObjectEvent.prototype, 'initEvent');
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('test', false, false, null);
      Emitter.dispatchEvent(event);

      expect(ObjectEvent.prototype.initEvent).toHaveBeenCalled();
    });

    it('even when it\'s a literal object with type', function(){
      // Code coverage workaround:
      var event = {type: 'test'};
      Emitter.dispatchEvent(event);

      // Now spy for testing:
      spyOn(ObjectEvent.prototype, 'initEvent');
      event = {type: 'test'};
      Emitter.dispatchEvent(event);

      expect(ObjectEvent.prototype.initEvent).toHaveBeenCalled();
    });
  });

  describe('be able to ran "stopPropagation"', function(){
    it('and updated "cancelBubble"', function(){
      var event = new ObjectEvent('test', {bubbles: true});

      // False before it ran
      expect(event.cancelBubble).toBe(false);
      var listener = function(event){
        event.stopPropagation();
      };
      Emitter.addEventListener('test', listener);
      Emitter.dispatchEvent(event);

      // True outside
      expect(event.cancelBubble).toBe(true);

      // Now spy for testing:
      spyOn(ObjectEvent.prototype, 'stopPropagation');
      event = new ObjectEvent('test');
      Emitter.dispatchEvent(event);

      expect(ObjectEvent.prototype.stopPropagation).toHaveBeenCalled();
    });

    it('even when it\'s a native event', function(){
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('test', true, false, null);

      // False before it ran
      expect(event.cancelBubble).toBe(false);
      var listener = function(event){
        event.stopPropagation();
        expect(event.cancelBubble).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      Emitter.dispatchEvent(event);

      // True outside
      expect(event.cancelBubble).toBe(true);

      // Now spy for testing:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('test2', true, false, null);
      listener = function(event){
        spyOn(event, 'stopPropagation');
        event.stopPropagation();
        expect(event.stopPropagation).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('even when it\'s a literal object', function(){
      var event = {type: 'test', bubbles: true};

      // False before it ran
      expect(event.cancelBubble).toBe(undefined);
      var listener = function(event){
        event.stopPropagation();
        expect(event.cancelBubble).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      Emitter.dispatchEvent(event);

      // True outside
      expect(event.cancelBubble).toBe(true);

      // Now spy for testing:
      
      event = {type: 'test2'};
      listener = function(event){
        spyOn(event, 'stopPropagation');
        event.stopPropagation();
        expect(event.stopPropagation).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });
  });

  describe('be able to ran "stopImmediatePropagation"', function(){
    it('and updated "immediatePropagationStopped"', function(){
      var event = new ObjectEvent('test');

      // False before it ran
      expect(event.immediatePropagationStopped).toBe(false);
      var listener = function(event){
        event.stopImmediatePropagation();
      };
      Emitter.addEventListener('test', listener);
      Emitter.dispatchEvent(event);

      // True outside
      expect(event.immediatePropagationStopped).toBe(true);

      // Now spy for testing:
      spyOn(ObjectEvent.prototype, 'stopImmediatePropagation');
      event = new ObjectEvent('test');
      Emitter.dispatchEvent(event);

      expect(ObjectEvent.prototype.stopImmediatePropagation).toHaveBeenCalled();
    });

    it('even when it\'s a native event', function(){
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('test', false, false, null);

      // False before it ran
      expect(event.immediatePropagationStopped).toBe(undefined);
      var listener = function(event){
        event.stopImmediatePropagation();
        expect(event.immediatePropagationStopped).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      Emitter.dispatchEvent(event);

      // True outside
      expect(event.immediatePropagationStopped).toBe(true);

      // Now spy for testing:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('test2', false, false, null);
      listener = function(event){
        spyOn(event, 'stopImmediatePropagation');
        event.stopImmediatePropagation();
        expect(event.stopImmediatePropagation).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('even when it\'s a literal object', function(){
      var event = {type: 'test'};

      // False before it ran
      expect(event.immediatePropagationStopped).toBe(undefined);
      var listener = function(event){
        event.stopImmediatePropagation();
        expect(event.immediatePropagationStopped).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      Emitter.dispatchEvent(event);

      // True outside
      expect(event.immediatePropagationStopped).toBe(true);

      // Now spy for testing:
      
      event = {type: 'test2'};
      listener = function(event){
        spyOn(event, 'stopImmediatePropagation');
        event.stopImmediatePropagation();
        expect(event.stopImmediatePropagation).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });
  });

  describe('be able to ran "preventDefault"', function(){
    it('return true when not cancelable event', function(){
      var event = new ObjectEvent('test');

      // False before it ran
      expect(event.defaultPrevented).toBe(false);
      var listener = function(event){
        event.preventDefault();
        expect(event.defaultPrevented).toBe(false);
      };
      Emitter.addEventListener('test', listener);
      expect(Emitter.dispatchEvent(event)).toBe(true);

      // True outside
      expect(event.immediatePropagationStopped).toBe(false);

      // Now spy for testing:
      event = new ObjectEvent('test2');
      listener = function(event){
        spyOn(ObjectEvent.prototype, 'preventDefault');
        event.preventDefault();
        expect(ObjectEvent.prototype.preventDefault).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('return false when cancelable event', function(){
      var event = new ObjectEvent('test', {cancelable: true});

      // False before it ran
      expect(event.defaultPrevented).toBe(false);
      var listener = function(event){
        event.preventDefault();
        expect(event.defaultPrevented).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      var result = Emitter.dispatchEvent(event);
      expect(result).toBe(false);

      // True outside
      expect(event.defaultPrevented).toBe(true);

      // Now spy for testing:
      event = new ObjectEvent('test2', {cancelable: true});
      listener = function(event){
        spyOn(ObjectEvent.prototype, 'preventDefault');
        event.preventDefault();
        expect(ObjectEvent.prototype.preventDefault).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('return true when not cancelable event of native event', function(){
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('test', false, false, null);

      // False before it ran
      expect(event.defaultPrevented).toBe(false);
      var listener = function(event){
        event.preventDefault();
        expect(event.defaultPrevented).toBe(false);
      };
      Emitter.addEventListener('test', listener);
      expect(Emitter.dispatchEvent(event)).toBe(true);

      // True outside
      expect(event.immediatePropagationStopped).toBe(false);

      // Now spy for testing:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('test2', false, false, null);
      listener = function(event){
        spyOn(ObjectEvent.prototype, 'preventDefault');
        event.preventDefault();
        expect(ObjectEvent.prototype.preventDefault).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('return false when cancelable event of native event', function(){
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('test', false, true, null);

      // False before it ran
      expect(event.defaultPrevented).toBe(false);
      var listener = function(event){
        event.preventDefault();
        expect(event.defaultPrevented).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      var result = Emitter.dispatchEvent(event);
      expect(result).toBe(false);

      // True outside
      expect(event.defaultPrevented).toBe(true);

      // Now spy for testing:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('test2', false, true, null);
      listener = function(event){
        spyOn(ObjectEvent.prototype, 'preventDefault');
        event.preventDefault();
        expect(ObjectEvent.prototype.preventDefault).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('return true when not cancelable event of literal object', function(){
      var event = {type: 'test'};

      // False before it ran
      expect(event.defaultPrevented).toBeUndefined();
      var listener = function(event){
        event.preventDefault();
        expect(event.defaultPrevented).toBe(false);
      };
      Emitter.addEventListener('test', listener);
      expect(Emitter.dispatchEvent(event)).toBe(true);

      // True outside
      expect(event.immediatePropagationStopped).toBe(false);

      // Now spy for testing:
      event = {type: 'test2'};
      listener = function(event){
        spyOn(ObjectEvent.prototype, 'preventDefault');
        event.preventDefault();
        expect(ObjectEvent.prototype.preventDefault).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });

    it('return false when cancelable event of literal object', function(){
      var event = {type: 'test', cancelable: true};

      // False before it ran
      expect(event.defaultPrevented).toBeUndefined();
      var listener = function(event){
        event.preventDefault();
        expect(event.defaultPrevented).toBe(true);
      };
      Emitter.addEventListener('test', listener);
      var result = Emitter.dispatchEvent(event);
      expect(result).toBe(false);

      // True outside
      expect(event.defaultPrevented).toBe(true);

      // Now spy for testing:
      event = {type: 'test2', cancelable: true};
      listener = function(event){
        spyOn(ObjectEvent.prototype, 'preventDefault');
        event.preventDefault();
        expect(ObjectEvent.prototype.preventDefault).toHaveBeenCalled();
      };
      Emitter.addEventListener('test2', listener);
      Emitter.dispatchEvent(event);
    });
  });
});
