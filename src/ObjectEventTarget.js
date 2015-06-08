// Add a ObjectEventTarget with a prototype that can be used
// by any object in the JavaScript context, to add, remove and trigger
// events.
// Example:
// ```
// function Foo(){}
// Foo.prototype = ObjectEventTarget.prototype;
// foo = new Foo();
// foo.addEventListener('dosomething', function(){
//   console.log(this, 'do something');
// });
// foo.dispatchEvent({type: 'dosomething'});
// // [Foo object], do something
// ```
//
// In old browsers that doesn't support enumerable property definition, the prototype
// methods will be iterated when you do for in, so don't forget to use the hasOwnProperty
(function(root) {
  'use strict';

  // Load options that can be setup before loading the library
  var options = root.ObjectEventTarget ? root.ObjectEventTarget.options : {};
  var DEBUG = root.DEBUG || options.DEBUG;
  var VERSION = options.VERSION || 'development';

  // Named object what contains the events queue for an object
  var EventsMap = options.EventsMap;
  if (!EventsMap){
    EventsMap = function EventsMap(type, callback){
      this[type] = [callback];
    };
    EventsMap.prototype = Object.prototype;
  }

  function typeErrors(type, callback){
    if (typeof type !== 'string' || type.length === 0){
      throw new TypeError('Type must be a string and can\'t be empty');
    }
    if (typeof callback !== 'function'){
      throw new TypeError('Callback must be a function');
    }
  }

  var WeakMap = options.WeakMap || root.WeakMap;
  if (!WeakMap) {
    WeakMap = function WeakMapArrayShim(){
      // A simple shim for WeakMap, only for usage in this lib, so it doesn't
      // support all features from a WeakMap, and it uses Array.indexOf for
      // search that isn't very performatic but allow us to have support in
      // old browsers

      this.map = [];
    };
    var find = function (arr, key){
      // Search for a meta element for the WeakMap shim, and if found
      // move this element for the begin of the array, to optimize usual
      // repetitive usage of the same object, and fast find the most used

      for (var m = arr.length - 1, i = m; i >= 0; i--){
        if (arr[i].key === key) {
          if (i !== m){
            var r = arr.splice(i, 1);
            arr.push(r[0]);
          }
          return arr[m];
        }
      }
      return;
    };
    WeakMap.prototype = {
      get: function (obj){
        var meta = find(this.map, obj);
        return meta && meta.value;
      },
      set: function (obj, value){
        var meta = find(this.map, obj);
        if (meta){
          meta.value = value;
        } else {
          this.map.push({key: obj, value: value});
        }
      },
      has: function (obj){
        return !!find(this.map, obj);
      },
      delete: function (obj){
        var meta = find(this.map, obj);
        if (meta) {
          this.map.pop();
        }
      }
    };
  }

  var map = new WeakMap();
  function add(obj, type, callback){
    // Add a object with a event type and callback to a weakmap

    typeErrors(type, callback);

    if (map.has(obj)) {
      if (map.get(obj)[type]) {
        map.get(obj)[type].push(callback);
        return;
      }
      map.get(obj)[type] = [callback];
      return;
    }
    map.set(obj, new EventsMap(type, callback));
  }

  function remove(obj, type, callback){
    // Removes the callback from the event queue and keep the memory clean
    // removing empty events queue and objects without events from the map

    typeErrors(type, callback);

    if (!map.has(obj)){
      return;
    }
    var eventsMap = map.get(obj);
    var eventQueue = eventsMap[type];
    if (!eventQueue){
      return;
    }
    var pos = eventQueue.indexOf(callback);
    if (pos === -1){
      return;
    }
    // Remove all matching callbacks
    while(pos !== -1){
      eventQueue.splice(pos, 1);
      pos = eventQueue.indexOf(callback);
    }

    // Remove the propertie with array when the array is empty
    if (eventQueue.length === 0){
      delete eventsMap[type];
    }

    // If the eventsMap isn't empty don't remove from the objects weakmap
    for (var prop in eventsMap)
    if (eventsMap.hasOwnProperty(prop)) {
      return;
    }
    map.delete(obj);
  }

  function dispatch(obj, event){
    // Dispatch a queue of events of the tye passed inside the event object

    // Check if the event is a valid object
    if (!event || typeof event.type !== 'string'){
      throw new TypeError('Illegal invocation');
    }

    // Init the event
    ObjectEvent.prototype.initEvent.call(event);

    var eventsMap = map.get(obj);
    if (!eventsMap) {
      return true;
    }
    var eventsQueue = eventsMap[event.type];
    if (!eventsQueue) {
      return true;
    }

    var eventPhase = ObjectEvent.prototype.AT_TARGET;

    // Bubbles support
    if (event.stack.length > 0) {
      if (!event.bubbles){
        return true;
      }
      if (event.cancelBubble){
        return true;
      }
      if (event.stack.indexOf(obj)!== -1){
        return true;
      }

      eventPhase = ObjectEvent.prototype.BUBBLING_PHASE;
    }

    // Add the obj instance to stack
    event.stack.push(obj);

    // Prevent forcing event new values after begin the callback queue calls
    var returnValue = true;
    var cancelable = !!event.cancelable;
    var type = event.type;
    var bubbles = event.bubbles;
    var cancelBubble = event.cancelBubble;

    var stack = event.stack;
    var target = stack[stack.length - 1];
    var currentTarget = stack[0];

    function resetEvent(event){
      // Ensure non-writetible event properties states
      event.eventPhase = eventPhase;
      event.cancelable = cancelable;
      event.returnValue = returnValue;
      event.defaultPrevented = !returnValue;
      event.type = type;
      event.stack = stack;
      event.target = target;
      event.currentTarget = currentTarget;
      event.bubbles = bubbles;
      event.cancelBubble = cancelBubble;
    }

    // Clone the array before iterate, avoid event changing the queue on fly
    eventsQueue = eventsQueue.slice();
    try{
      for (var i = 0, m = eventsQueue.length; i < m; i++) {
        resetEvent(event);

        // Call next event, using the object instance as context
        eventsQueue[i].call(obj, event);

        // Update the returnValue when default has been prevented
        returnValue = returnValue && !(cancelable && event.defaultPrevented);

        // Stop the immidiate propagation and return the returnValue
        if (event.immediatePropagationStopped) {
          return returnValue;
        }
      }
    }catch(e){
      setTimeout(function(){
        throw e;
      });
    }

    event.eventPhase = ObjectEvent.prototype.NONE;

    // true if default hasn't been prevented
    return returnValue;
  }

  function ObjectEventTarget(){
    // It's a singleton, once we have the instance for the prototype
    // the user should not be allowed to create new instances
    if (ObjectEventTarget.prototype.constructor === ObjectEventTarget){
      throw new TypeError('Illegal constructor');
    }

    function illegalIvovation(context){
      if (context === ObjectEventTarget.prototype) {
        throw new TypeError('Illegal invocation');
      }
    }

    this.constructor = ObjectEventTarget;

    this.addEventListener = function(type, callback){
      illegalIvovation(this);
      add(this, type, callback);
    };

    this.removeEventListener = function(type, callback){
      illegalIvovation(this);
      remove(this, type, callback);
    };

    this.dispatchEvent = function(event){
      illegalIvovation(this);
      return dispatch(this, event);
    };
  }

  ObjectEventTarget.prototype = Object.prototype;
  ObjectEventTarget.prototype = new ObjectEventTarget();

  function ObjectEvent(type, options){
    if (arguments.length === 0){
      throw new TypeError('Failed to construct \'ObjectEvent\': An event name must be provided.');
    }

    options = options || {};

    // Time that the event has created
    this.timeStamp = Date.now();

    // Allow preventDefault()
    this.cancelable = options.cancelable === true;

    // Allow bubbling()
    this.bubbles = options.bubbles === true;

    // Add custom details to the event
    if (typeof options.detail !== 'undefined') {
      this.detail = options.detail;
    }

    // Phase of the event
    this.eventPhase = ObjectEvent.prototype.NONE;

    this.stack = [];
    this.immediatePropagationStopped = false;
    this.cancelBubble = false;
    this.defaultPrevented = false;
    this.returnValue = true;
    this.type = String(type);
  }
  ObjectEvent.prototype.NONE = 0;
  ObjectEvent.prototype.AT_TARGET = 2;
  ObjectEvent.prototype.BUBBLING_PHASE = 3;
  ObjectEvent.prototype.initEvent = function() {
    // Init event if it has some propertie wrong, fix it

    // Time that the event has created
    this.timeStamp = this.timeStamp || Date.now();

    // Allow preventDefault()
    this.cancelable = this.cancelable === true;

    // Phase of the event
    this.eventPhase = ObjectEvent.prototype.NONE;

    // Cleanup the stack and add the instance to the event stack
    if (!this.stack || !this.stack.push) {
      // Opera and other browsers can throw exception if you are using native Event instance
      try{
        this.stack = [];
      }catch(e){}
    }

    this.immediatePropagationStopped = this.immediatePropagationStopped === true;
    this.cancelBubble = this.cancelBubble === true;
    this.defaultPrevented = this.cancelable && this.defaultPrevented === true;
    this.returnValue = true;
    this.type = String(this.type);

    // Add methods when they don't exist
    if (!(this instanceof ObjectEvent)){
      if (!this.hasOwnProperty('preventDefault')){
        var nativePreventDefault = this.preventDefault;
        if (typeof nativePreventDefault !== 'function'){
          nativePreventDefault = function(){};
        }
        this.preventDefault = function(){
          nativePreventDefault.apply(this, arguments);
          ObjectEvent.prototype.preventDefault.apply(this, arguments);
        };
      }
      if (!this.hasOwnProperty('stopPropagation')){
        var nativeStopPropagation = this.stopPropagation;
        if (typeof stopPropagation !== 'function'){
          nativeStopPropagation = function(){};
        }
        this.stopPropagation = function(){
          nativeStopPropagation.apply(this, arguments);
          ObjectEvent.prototype.stopPropagation.apply(this, arguments);
        };
      }
      if (!this.hasOwnProperty('stopImmediatePropagation')){
        var nativeStopImmediatePropagation = this.stopImmediatePropagation;
        if (typeof stopImmediatePropagation !== 'function'){
          nativeStopImmediatePropagation = function(){};
        }
        this.stopImmediatePropagation = function(){
          nativeStopImmediatePropagation.apply(this, arguments);
          ObjectEvent.prototype.stopImmediatePropagation.apply(this, arguments);
        };
      }
    }
  };
  ObjectEvent.prototype.preventDefault = function(){
    // Prevent the default result, makes the dispatchEvent returns false
    this.defaultPrevented = !!this.cancelable;
  };
  ObjectEvent.prototype.stopPropagation = function(){
    // Don't allow the next callback to be called
    this.cancelBubble = !!this.bubbles;
  };
  ObjectEvent.prototype.stopImmediatePropagation = function(){
    // Don't allow the next callback to be called
    this.immediatePropagationStopped = true;
  };

  // Prevent enumerable prototype when supported by the browser
  if (Object.defineProperties){
    var definePropertiesArgs = function (prototype){
      var props = {};
      for (var k in prototype) {
        if (prototype.hasOwnProperty(k)){
          props[k] = {
            value: prototype[k],
            enumerable: false
          };
        }
      }
      return [prototype, props];
    };

    // ObjectEvent remove enumerable prototype
    Object.defineProperties.apply(Object, definePropertiesArgs(ObjectEvent.prototype));
    // ObjectEventTarget remove enumerable prototype
    Object.defineProperties.apply(Object, definePropertiesArgs(ObjectEventTarget.prototype));
  }

  // Expose the ObjectEventTarget to global
  ObjectEventTarget.VERSION = VERSION;
  root.ObjectEventTarget = ObjectEventTarget;
  root.ObjectEvent = ObjectEvent;

  ObjectEventTarget.DEBUG = DEBUG;
  if (DEBUG){
    ObjectEventTarget.__debug = {
      EventsMap: EventsMap,
      typeErrors: typeErrors,
      WeakMap: WeakMap,
      map: map
    };
  }

  // Export as module to nodejs
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = {
      ObjectEventTarget: ObjectEventTarget,
      ObjectEvent: ObjectEvent
    };
  }
})(this);
