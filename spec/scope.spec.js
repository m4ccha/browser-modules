'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  describe("after creating application", function() {
    var app;
    beforeEach(function() {
      app = modularApp.create("test");
      expect(app).not.toBeNull();
    });
    afterEach(function() {
      app.terminate();
    });

    describe("when in bg code", function() {
      it("shouldn't be able to use closure in code posted to bg", function() {
        var object = "local";
        app.postBackground(function() { object = "changed"; });
        expect(object).toBe("local");
      });
      it("shouldn't be able to access fg globals", function() {
        global.test = "foreground";
        app.postBackground(function() {
          postForeground(function(arg) { global.fromFg = arg }, global.test);
        });
        expect(global.fromFg).not.toBeDefined();
      });
    });
  });
});

