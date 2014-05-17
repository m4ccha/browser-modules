'use strict';

var modularApp = require("../compat/node");

describe("browser-modules", function() {
  describe("after creating application", function() {
    var app;
    beforeEach(function() {
      app = modularApp.create("test");
      expect(app).not.toBeNull();

      global.fixture = {};
    });
    afterEach(function() {
      app.terminate();
    });

    describe("when inside a module", function() {
      function expectResultOfEvalInsideAModule(expected, func) {
        return function(done) {
          global.fixture.done = function(arg) {
            expect(arg).toBe(expected);
            done();
          };
          app.postBackground(function(code) {
            var _eval = require("../spec/modules/eval");
            var result = _eval("("+ code.toString() +")()");
            postForeground(function(arg) { global.fixture.done(arg); }, result);
          }, func.toString());
        };
      }

      it("is able to require module with exports of type function",
        expectResultOfEvalInsideAModule("function", function() {
          return typeof require("../spec/modules/eval");
        }));
      it("is able to require module with exports of type object",
        expectResultOfEvalInsideAModule("object", function() {
          return typeof require("../spec/modules/checktype");
        }));
      it("is able to use only part of other modules exports",
        expectResultOfEvalInsideAModule("function", function() {
          return typeof require("../spec/modules/checkequal").check;
        }));
    });
  });
});

