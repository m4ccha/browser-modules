'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  it("should be able to create application", function() {
    var app = modularApp.create("test");
    expect(app).not.toBeNull();
  });

  describe("after creating application", function() {
    var app;
    beforeEach(function() {
      app = modularApp.create("test");
      expect(app).not.toBeNull();

      global.fixture = {};
    });

    it("should be able to post empty function to bg", function() {
      app.postBackground(function() {});
    });
    it("should be able to post 3 empty functions to bg", function() {
      app.postBackground(function() {});
      app.postBackground(function() {});
      app.postBackground(function() {});
    });
    it("shouldn't be able to post not invokable objects to bg", function() {
      expect(function() { app.postBackground({}); }).toThrow();
      expect(function() { app.postBackground([]); }).toThrow();
      expect(function() { app.postBackground(""); }).toThrow();
      expect(function() { app.postBackground(0); }).toThrow();
      expect(function() { app.postBackground(true); }).toThrow();
      expect(function() { app.postBackground(undefined); }).toThrow();
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
      it("should be able to post f with string arg back to fg", function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toBe("test");
          done();
        };
        app.postBackground(function() {
          postForeground(function(arg) { global.fixture.done(arg); }, "test");
        });
      });
      it("should be able to post f with int arg back to fg", function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toBe(0xBaadF00D);
          done();
        };
        app.postBackground(function() {
          postForeground(
            function(arg) { global.fixture.done(arg); },
            0xBaadF00D
            );
        });
      });
      it("should be able to post f with array arg back to fg", function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toEqual([0, 1, 2, 4, 8]);
          done();
        };
        app.postBackground(function() {
          postForeground(
            function(arg) { global.fixture.done(arg); },
            [0, 1, 2, 4, 8]
            );
        });
      });
      it("should be able to post f with object arg back to fg", function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toEqual({});
          done();
        };
        app.postBackground(function() {
          postForeground(function(arg) { global.fixture.done(arg); }, {});
        });
      });
      it("should be able to post f with 2 args", function(done) {
        global.fixture.done = function(arg0, arg1) {
          expect(arg0).toBe(0);
          expect(arg1).toBe(1);
          done();
        };
        app.postBackground(function() {
          postForeground(function(a0,a1) { global.fixture.done(a0,a1); }, 0,1);
        });
      });
    });
  });
});

