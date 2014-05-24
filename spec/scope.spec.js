'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  beforeEach(function() {
    global.fixture = {};
  });

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

      describe("with second application running", function() {
        var app2;
        beforeEach(function() {
          app2 = modularApp.create("test2");
          expect(app).not.toBeNull();
        });
        afterEach(function() {
          app2.terminate();
        });

        it("should have different module instances in each app",function(done){
          global.fixture.done = function(arg) {
            expect(arg).not.toBeDefined();
            done();
          };
          global.fixture.tick = function() {
            app2.postBackground(function() {
              var test = require("../spec/modules/eval").test;
              postForeground(function(arg) { global.fixture.done(arg); }, test);
            });
          };
          app.postBackground(function() {
            var _eval = require("../spec/modules/eval");
            var test = _eval("exports.test = true;");
            postForeground(function() { global.fixture.tick(); });
          });
        });
      });
    });
  });
});

