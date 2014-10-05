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
(function(root) {
  'use strict';
  // Named object what contains the events queue for an object
  function EventsMap(type, callback){
    this[type] = [callback];
  }
  EventsMap.prototype = Object.prototype;
  
  function typeErrors(type, callback){
    if (typeof type !== 'string' || type.length === 0){
      throw new TypeError('Type must be a string and can\'t be empty');
    }
    if (typeof callback !== 'function'){
      throw new TypeError('Callback must be a function');
    }
  }
  
  var WeakMap = root.WeakMap;
  if (!WeakMap) {
    WeakMap = function WeakMapArrayShim(){
      // A simple shim for WeakMap, only for usage in this lib, so it doesn't
      // support all features from a WeakMap, and it uses Array.indexOf for
      // search that isn't very performatic but allow us to have support in
      // old browsers

      this.map = [];
    }
    var find = function (arr, key){
      // Search for a meta element for the WeakMap shim, and if found
      // move this element for the begin of the array, to optimize usual
      // repetitive usage of the same object, and fast find the most used

      for (var i = 0, m = arr.length; i < m; i++){
        if (arr[i].key === key) {
          if (i > 0){
            var r = arr.splice(i, 1);
            arr.unshift(r);
            return r;
          }
          return arr[i];
        }
      }
      return;
    }
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
          this.map.shift();
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
      throw new TypeError('Illegal invocation')
    }
    var eventsMap = map.get(obj);
    if (!eventsMap) {
      return;
    }
    var eventsQueue = eventsMap[event.type];
    if (!eventsQueue) {
      return;
    }
    // Clone the array before iterate, avoid event changing the queue on fly
    eventsQueue = eventsQueue.slice();
    for (var i = 0, m = eventsQueue.length; i < m; i++) {
      eventsQueue[i].call(obj, event);
    }
  }
  
  function ObjectEventTarget(){
    // It's a singleton, once we have the instance for the prototype
    // the user should not be allowed to create new instances
    if (ObjectEventTarget.prototype instanceof ObjectEventTarget){
      throw new TypeError('Illegal constructor');
    }
    
    function illegalIvovation(context){
      if (context === ObjectEventTarget.prototype) {
        throw new TypeError('Illegal invocation')
      }
    }
    
    this.addEventListener = function(type, callback){
      illegalIvovation(this);
      add(this, type, callback);
    };
    this.removeEventListener = function(type, callback){
      illegalIvovation(this)
      remove(this, type, callback);
    };
    this.dispatchEvent = function(event){
      illegalIvovation(this);
      dispatch(this, event);
    };
  }

  ObjectEventTarget.prototype = Object.prototype;
  ObjectEventTarget.prototype = new ObjectEventTarget();

  // Expose the ObjectEventTarget to global
  root.ObjectEventTarget = ObjectEventTarget;
})(this)