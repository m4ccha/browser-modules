'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  it("should be able to create application", function() {
    var app = modularApp.create("test");
    expect(app).not.toBeNull();
  });

  function typeName(obj) {
    var type = typeof obj;
    if (type === "object") {
      if (obj === null) return "null";
      if (obj instanceof Array) return "array";
    }
    return type;
  }

  describe("after creating application", function() {
    var app;
    beforeEach(function() {
      app = modularApp.create("test");
      expect(app).not.toBeNull();

      global.fixture = {};
    });

    var params = [{}, [], "", 0, true, null, undefined];
    params.forEach(function(testParam) {
      var testName = "shouldn't be able use %s as posted function";
      it(testName.replace("%s", typeName(testParam)), function() {
        expect(function() { app.postBackground(testParam); }).toThrow();
      });
    });
    it("should be able to post empty function to bg", function() {
      app.postBackground(function() {});
    });
    it("should be able to post 3 empty functions to bg", function() {
      app.postBackground(function() {});
      app.postBackground(function() {});
      app.postBackground(function() {});
    });
    params.forEach(function(testParam) {
      var testName = "should be able post %s as function argument";
      it(testName.replace("%s", typeName(testParam)), function() {
        app.postBackground(function() {}, testParam);
      });
    });

    describe("when in bg code", function() {
      it("should be able to post empty function back to fg", function(done) {
        global.fixture.done = done;
        app.postBackground(function() {
          postForeground(function() { global.fixture.done() });
        });
      }, 500);
      it("should be able to post 3 empty functions back to fg", function(done) {
        var count = 0;
        global.fixture.tick = function() { if (++count === 3) done(); };
        app.postBackground(function() {
          postForeground(function() { global.fixture.tick(); });
          postForeground(function() { global.fixture.tick(); });
          postForeground(function() { global.fixture.tick(); });
        });
      }, 500);
      params.forEach(function(testParam) {
        var testName = "should be able to post fn with %s argument back to fg";
        it(testName.replace("%s", typeName(testParam)), function(done) {
          global.fixture.done = function(arg) {
            expect(arg).toEqual(testParam);
            done();
          };
          app.postBackground(function(arg) {
            postForeground(function(arg) { global.fixture.done(arg); }, arg);
          }, testParam);
        }, 500);
      });
      params.forEach(function(testParam) {
        var testName = "shouldn't be able use %s as posted function";
        it(testName.replace("%s", typeName(testParam)), function(done) {
          global.fixture.done = done;
          app.postBackground(function(arg) {
            try { app.postForeground(arg); } catch(e) {}
            postForeground(function() { global.fixture.done(); });
          }, testParam);
        }, 500);
      });
    });
  });
});

