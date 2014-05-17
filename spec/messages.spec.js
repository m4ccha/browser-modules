'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  beforeEach(function() {
    global.fixture = {};
  });

  function typeName(obj) {
    var type = typeof obj;
    if (type === "object") {
      if (obj === null) return "null";
      if (obj instanceof Array) return "array";
    }
    return type;
  }

  var params = [{}, [], "", 0, true, null, undefined];

  describe("when calling run", function() {
    var app;
    afterEach(function() {
      app.terminate();
    });

    it("should be able to create application", function() {
      app = modularApp.run(function() {});
      expect(app).not.toBeNull();
    });
    it("should be able to create 3 applications", function() {
      var app0 = modularApp.run(function() {});
      expect(app0).not.toBeNull();
      var app1 = modularApp.run(function() {});
      expect(app1).not.toBeNull();
      var app2 = modularApp.run(function() {});
      expect(app2).not.toBeNull();
    });
    params.forEach(function(testParam) {
      var testName = "shouldn't be able use %s as main app function";
      it(testName.replace("%s", typeName(testParam)), function() {
        expect(function() { modularApp.run(testParam); }).toThrow();
      });
    });

    describe("when in bg code", function() {
      it("should be able to post empty function back to fg", function(done) {
        global.fixture.done = done;
        app = modularApp.run(function() {
          postForeground(function() { global.fixture.done() });
        });
      });
      it("should be able to post 3 empty functions back to fg", function(done) {
        var count = 0;
        global.fixture.tick = function() { if (++count === 3) done(); };
        app = modularApp.run(function() {
          postForeground(function() { global.fixture.tick(); });
          postForeground(function() { global.fixture.tick(); });
          postForeground(function() { global.fixture.tick(); });
        });
      });
      params.forEach(function(testParam) {
        var testName = "shouldn't be able use %s as posted function";
        it(testName.replace("%s", typeName(testParam)), function(done) {
          global.fixture.done = done;
          app = modularApp.run(function(arg) {
            try { app.postForeground(arg); } catch(e) {}
            postForeground(function() { global.fixture.done(); });
          }, testParam);
        });
      });
    });
  });

  describe("after creating application", function() {
    var app;
    beforeEach(function() {
      app = modularApp.create("test");
      expect(app).not.toBeNull();
    });
    afterEach(function() {
      //app.terminate();
    });

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
      });
      it("should be able to post 3 empty functions back to fg", function(done) {
        var count = 0;
        global.fixture.tick = function() { if (++count === 3) done(); };
        app.postBackground(function() {
          postForeground(function() { global.fixture.tick(); });
          postForeground(function() { global.fixture.tick(); });
          postForeground(function() { global.fixture.tick(); });
        });
      });
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
        });
      });
      params.forEach(function(testParam) {
        var testName = "shouldn't be able use %s as posted function";
        it(testName.replace("%s", typeName(testParam)), function(done) {
          global.fixture.done = done;
          app.postBackground(function(arg) {
            try { app.postForeground(arg); } catch(e) {}
            postForeground(function() { global.fixture.done(); });
          }, testParam);
        });
      });
    });
  });
});

