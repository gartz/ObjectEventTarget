/*globals describe, it, expect, beforeEach*/
/*globals ObjectEventTarget*/
describe('ObjectEventTarget should', function(){
  it('be in the DEBUG mode', function(){
    expect(ObjectEventTarget.__debug).toBeDefined();
  });
});
describe('WeakMapsShim should', function() {

  var guts;
  var map;

  beforeEach(function() {
    guts = ObjectEventTarget.__debug;
    if( guts && guts.WeakMap ){
      map = new guts.WeakMap();
    }
  });

  it('be available on debug mode', function() {
    expect(guts.WeakMap).toBeDefined();
  });

  it('have the method "get"', function() {
    expect(map.get).toBeDefined();
  });

  it('have the method "set"', function() {
    expect(map.set).toBeDefined();
  });

  it('have the method "has"', function() {
    expect(map.has).toBeDefined();
  });

  it('have the method "delete"', function() {
    expect(map.delete).toBeDefined();
  });

  describe('expect method "set" to', function(){
    it('add new element for each different object added', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      map.set(obj1, true);
      map.set(obj2, {});
      map.set(obj3, '');

      expect(map.map.length).toBe(3);
    });

    it('change reference values of existing objects', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      map.set(obj1, true);
      map.set(obj2, {});
      map.set(obj3, '');

      map.set(obj1, false);
      map.set(obj2, []);
      map.set(obj3, null);

      expect(map.map.length).toBe(3);
    });
  });

  describe('expect method "get" to', function(){
    it('retrive the value of a setted object', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      map.set(obj1, true);
      map.set(obj2, obj3);
      map.set(obj3, '');

      expect(map.get(obj1)).toBe(true);
      expect(map.get(obj2)).toBe(obj3);
      expect(map.get(obj3)).toBe('');

      expect(map.map.length).toBe(3);
    });

    it('retrive the object value everytime it changes', function(){
      var obj1 = {};
      map.set(obj1, 123);
      expect(map.get(obj1)).toBe(123);
      map.set(obj1, 321);
      expect(map.get(obj1)).toBe(321);
      map.set(obj1, 213);
      expect(map.get(obj1)).toBe(213);
      
      expect(map.map.length).toBe(1);
    });

    it('retrive the undefined when the object has no reference', function(){
      var obj1 = {}, obj2 = {};
      map.set(obj1, 123);
      expect(map.get(obj2)).toBeUndefined();
      
      expect(map.map.length).toBe(1);
    });
  });

  describe('expect method "has" to', function(){
    it('return true when the object exist', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      map.set(obj1, true);
      map.set(obj2, obj3);
      map.set(obj3, '');

      expect(map.has(obj1)).toBe(true);
      expect(map.has(obj2)).toBe(true);
      expect(map.has(obj3)).toBe(true);

      expect(map.map.length).toBe(3);
    });

    it('return false when the object doesn\'t exist', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      expect(map.has(obj1)).toBe(false);
      map.set(obj1, 123);
      expect(map.has(obj2)).toBe(false);
      map.set(obj2, 321);
      expect(map.has(obj3)).toBe(false);
      map.set(obj3, 213);
      expect(map.has(obj1)).toBe(true);
      
      expect(map.map.length).toBe(3);
    });

    it('return false when the object has been deleted', function(){
      var obj1 = {};
      expect(map.has(obj1)).toBe(false);
      map.set(obj1, 123);
      expect(map.has(obj1)).toBe(true);
      map.delete(obj1);
      expect(map.has(obj1)).toBe(false);
      
      expect(map.map.length).toBe(0);
    });
  });

  describe('expect method "delete" to', function(){
    it('return do nothing when the object doesn\'t exist', function(){
      var obj1 = {};
      map.delete(obj1);

      expect(map.map.length).toBe(0);
    });

    it('delete only the reference where delete where called', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      map.set(obj1, 123);
      map.set(obj2, 321);
      map.set(obj3, 213);
      expect(map.map.length).toBe(3);

      map.delete(obj2);
      expect(map.map.length).toBe(2);
      expect(map.get(obj1)).toBe(123);
      expect(map.get(obj3)).toBe(213);
      expect(map.get(obj2)).toBeUndefined();
    });

    it('delete and set multiple times', function(){
      var obj1 = {}, obj2 = {}, obj3 = {};
      map.set(obj1, 123);
      map.set(obj2, 321);
      map.set(obj3, 213);
      expect(map.map.length).toBe(3);
      map.delete(obj2);
      expect(map.map.length).toBe(2);
      expect(map.get(obj2)).toBeUndefined();
      map.set(obj2, true);
      expect(map.get(obj2)).toBe(true);
      expect(map.map.length).toBe(3);
      map.delete(obj2);
      expect(map.map.length).toBe(2);
      expect(map.get(obj2)).toBeUndefined();
      expect(map.get(obj1)).toBe(123);
      expect(map.get(obj3)).toBe(213);
    });
  });
});
