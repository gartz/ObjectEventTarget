ObjectEventTarget
=================

A same behaviour EventTarget prototype, that can work with any object from JavaScript

Motivation
----------

You know as everybody knows how to use the EventTarget today, because every Node instance (HTML Elements) prototype it. And that's make it awesome. You can prototype your objects with this and you will have support to events.

Also it can be used as prototype of a shim to EventTarget in non-modern browsers. Because it's compatible with ES3.

How to use
----------

Prototype your constructor like this:

```
function Foo(){}
Foo.prototype = ObjectEventTarget.prototype;
```

Now you have access to EventTarget methods, so let's implement a mehtod that dispatch a event type:

```
function AsyncFoo(){
  this.bar = function(){
    this.dispatchEvent({type: 'beforebar'});
    // Do something then...
    var self = this;
    setTimeout(function (){
      // I'm async
      self.dispatchEvent({type: 'bar'});
    }, 1e3);
  }
}
AsyncFoo.prototype = ObjectEventTarget.prototype;
```

Now you can add some events to you AsyncFoo instances like this:

```
instanceOne = new AsyncFoo();
instanceOne.addEventListener('beforebar', function(){
  console.log('You triggered bar from a AsyncFoo instance');
});
instanceOne.addEventListener('bar', function(){
  console.log('The method bar was async and finished calling "bar" event type');
});
instanceOne.bar();
// #1: You triggered bar from a AsyncFoo instance
// after a seccond
// #2: The method bar was async and finished calling "bar" event type
```

The rest you know...

Methods
-------

* **addEventListener( eventType, callback )**
* **removeEventListener( eventType, callback )**
* **dispatchEvent( event )** The event can be any object that has "type" propertie as string, you also can use `new Event('myEvent')` or `new ObjectEvent('myEvent')` where the second is compatible with non-modern browser and nodejs.

Event properties
----------------

* **type** the name/type of the event
* **immediatePropagationStopped** when a callback stoped the event chain (recomend to use the Event or CustomEvent constructor to use this)
