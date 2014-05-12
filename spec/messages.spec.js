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
      it("should be able to post a string back to fg", function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toBe("test");
          done();
        };
        app.postBackground(function() {
          postForeground(function(arg) { global.fixture.done(arg); }, "test");
        });
      });
    });
  });
});

