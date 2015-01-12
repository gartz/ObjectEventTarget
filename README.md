ObjectEventTarget
=================

[![npm version](https://badge.fury.io/js/objecteventtarget.svg)](http://badge.fury.io/js/objecteventtarget)
[![Build Status](https://travis-ci.org/gartz/ObjectEventTarget.svg?branch=master)](https://travis-ci.org/gartz/ObjectEventTarget)
[![Dependency Status](https://gemnasium.com/gartz/ObjectEventTarget.svg)](https://gemnasium.com/gartz/ObjectEventTarget)
[![Coverage Status](https://img.shields.io/coveralls/gartz/ObjectEventTarget.svg)](https://coveralls.io/r/gartz/ObjectEventTarget?branch=master)

A same behaviour EventTarget prototype, that can work with any object from JavaScript

Motivation
----------

You know as everybody knows how to use the EventTarget today, because every Node instance (HTML Elements) prototype it. And that's make it awesome. You can prototype your objects with this and you will have support to events.

Also it can be used as prototype of a shim to EventTarget in non-modern browsers. Because it's compatible with ES3.

Projects using it
-----------------

* [**Chronometer.js**](https://github.com/gartz/chronometer.js) This is just a chronometer constructor in JavaScript, that uses ObjectEventTarget as prototype to support events listeners, [*demo page*](http://gartz.github.io/chronometer.js/).
* [**Entity**](https://github.com/gartz/Entity) This is a JavaScript micro lib that allows you to create entity with events of attribute manipulation.

How to use
----------

Prototype your constructor like this:

```Javascript
function Foo(){}
Foo.prototype = ObjectEventTarget.prototype;
```

Now you have access to EventTarget methods, so let's implement a mehtod that dispatch a event type:

```Javascript
function AsyncFoo(){
  this.bar = function(){
    if (this.dispatchEvent({type: 'beforebar'})){
      console.log('The beforebar default behaviour');
    }
    // Do something then...
    var self = this;
    setTimeout(function (){
      // I'm async
      if (self.dispatchEvent(new ObjectEvent('bar', {cacelable: true})){
        console.log('The bar default behaviour');
      };
      console.log('End of bar method');
    }, 1e3);
  }
}
AsyncFoo.prototype = ObjectEventTarget.prototype;
```

Now you can add some events to you AsyncFoo instances like this:

```Javascript
instanceOne = new AsyncFoo();
instanceOne.addEventListener('beforebar', function (){
  console.log('You triggered bar from a AsyncFoo instance');
});
instanceOne.addEventListener('bar', function (event){
  event.preventDefault();
  console.log('The method bar was async and finished calling "bar" event type');
});
instanceOne.bar();
// #1: You triggered bar from a AsyncFoo instance
// #2: The beforebar default behaviour
// after a seccond
// #3: The method bar was async and finished calling "bar" event type
// #4: End of bar method
```

The rest you know...

Methods
-------

The methods aren't enumerables, but only for modern-browsers and nodejs, if you are supporting IE9- if you use *for in* in your object, make sure to check the *hasOwnProperty*, because if not, you will touch the methods.

* **addEventListener( eventType, callback )**
* **removeEventListener( eventType, callback )**
* **dispatchEvent( event )** The event can be any object that has "type" propertie as string, recomends to use `new ObjectEvent('type name')`.

Events
------

You can use `new ObjectEvent('type name', options)` to generate a event compatible with non-modern browsers and Nodejs.

Or you can just use a literal object with at least *type* property aka `{type: 'type name'}`.

I don't encorage you to use the browser *Event*, but it will work with it events like `Event`, `CustomEvent` and anyone that prototypes `Event`, also you can use modern constructor or non-moderns, it will work where the browser supports it, but when using this way, it will never change the *path* property.

There is properties in a event that after start the type dispatch callback queue, becomes read-only properties, you should not try to force change their values.

* **type** string (read) the name/type of the event
* **immediatePropagationStopped** boolean (read/write) when a callback stoped the event chain (recomend to use the Event or CustomEvent constructor to use this)
* **cancelable** boolean (read) define if the event can be cancelable when *preventDefault* is triggered
* **defaultPrevented** boolean (read/write) when true will set the *returnValue* to be `false` if the event is *cancelable*
* **returnValue** boolean (read) same value that is returned by the *dispatchEvent* method
* **eventPhase** number (read) expose the phase where the event is been triggered
* **path** array (read) a array with the objects in the orther that the event has triggered in it phases

**Events Methods**

When not available, because you probably used a literal object in the *dispatchEvent*, the event methods will be added to your object by mixing the methods in it.

* **initEvent()** executed before the first callback in the queue be called, also keeps the integrity of your object with every required property and method been setup
* **preventDefault()** will set *defaultPrevented* `true` when *cancelable* is `true`
* **stopImmediatePropagation()** will stop the immidiate propagation of the callbacks of the event type in the current queue

Events Error Handling
---------------------

When a callback from a event type throw an error, it will result in same as *stopImmediatePropagation*.

The throw will be show in your console, but will not stop your code flow that is expecting by the *dispatchEvent* result.

Projects Using it
-----------------

* [**Chronometer.js**](http://gartz.github.io/chronometer.js/) A chronometer constructor.

Overloading internals
---------------------

The **ObjectEventTarget** let you to overload it internal constructors to you personalize how it should work in your enviroment.

* **EventsMap( type, callback )** is created to store the events and callbacks, where type must become a property where contains a array of callbacks. If the instance exists it will decorate with new types with array and it callbacks.
* **WeakMap** is used to map the instances to it *EventsMap*, and must contain the methods **get( object )**, **set( object, value )**, **has( object )**, **delete( object )**.

To do the overloading, before the lib is loaded you must create a object called **ObjectEventTarget** with the property **options**.

```Javascript
window.ObjectEventTarget = {
  options: {
    EventsMap: MyCustomEventsMap,
    WeakMap: MyCustomWeakMap
  }
};
```
