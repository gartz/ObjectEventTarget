/*globals describe, it, expect, jasmine, beforeEach, spyOn*/
/*globals ObjectEventTarget*/
describe('ObjectEventTarget should', function(){
  it('be in the DEBUG mode', function(){
    expect(ObjectEventTarget.prototype.__debug).toBeDefined();
  });
});
describe('WeakMapsShim should', function() {

  var guts;
  var map;

  beforeEach(function() {
    guts = ObjectEventTarget.prototype.__debug;
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
  });
});
