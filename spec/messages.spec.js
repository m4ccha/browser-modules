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
      it("should be able to post empty function back to fg", function() {
        app.postBackground(function() { postForeground(function() {}); });
      });
      it("should be able to post 3 empty functions back to fg", function() {
        app.postBackground(function() {
          postForeground(function() {});
          postForeground(function() {});
          postForeground(function() {});
        });
      });
      it("should be able to post a string back to fg", function() {
        app.postBackground(function() {
          postForeground(function(arg) { global.fromFg = arg; }, "posted");
        });
        expect(global.fromFg).toBe("posted");
      });
    });
  });
});

