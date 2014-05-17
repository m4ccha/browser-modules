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

    function expectBgScopeContain(expectedType, variableName) {
      return function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toBe(expectedType);
          done();
        };
        app.postBackground(function(name) {
          var type = typeof eval(name);
          postForeground(function(arg) { global.fixture.done(arg); }, type);
        }, variableName);
      };
    }
    function expectBgVariablesEqual(variableName0, variableName1) {
      return function(done) {
        global.fixture.done = function(arg) {
          expect(arg).toBe(true);
          done();
        };
        app.postBackground(function(name0, name1) {
          var equal = (eval(name0) === eval(name1));
          postForeground(function(arg) { global.fixture.done(arg); }, equal);
        }, variableName0, variableName1);
      };
    }

    var params = [
      ["function", "require"],
      ["function", "importScripts"],
      ["function", "postForeground"],
      ["object", "exports"],
      ["object", "module"],
    ];

    describe("when in bg code", function() {
      params.forEach(function(testParam) {
        it("should have '"+ testParam[1] +"' "+ testParam[0] +" available",
          expectBgScopeContain(testParam[0], testParam[1]));
      });
      params.forEach(function(testParam) {
        it("should have 'module."+testParam[1]+"' "+testParam[0]+" available",
          expectBgScopeContain(testParam[0], "module."+ testParam[1]));
      });
      params.forEach(function(testParam) {
        it("'module."+testParam[1]+"' should be the same as '"+testParam[1]+"'",
          expectBgVariablesEqual("module."+ testParam[1], testParam[1]));
      });

      describe("inside a module", function() {
        function expectModuleScopeContain(expectedType, variableName) {
          return function(done) {
            global.fixture.done = function(arg) {
              expect(arg).toBe(expectedType);
              done();
            };
            app.postBackground(function(name) {
              var check = require("../spec/modules/checktype").check;
              var type = check(name);
              postForeground(function(arg) { global.fixture.done(arg); }, type);
            }, variableName);
          };
        }
        function expectModuleVariablesEqual(variableName0, variableName1) {
          return function(done) {
            global.fixture.done = function(arg) {
              expect(arg).toBe(true);
              done();
            };
            app.postBackground(function(name0, name1) {
              var check = require("../spec/modules/checkequal").check;
              var eq = check(name0, name1);
              postForeground(function(arg) { global.fixture.done(arg); }, eq);
            }, variableName0, variableName1);
          };
        }

        params.forEach(function(testParam) {
          it("should have '"+ testParam[1] +"' "+ testParam[0] +" available",
            expectModuleScopeContain(testParam[0], testParam[1]));
        });
        params.forEach(function(testParam) {
          it("should have 'module."+testParam[1]+"' "+testParam[0]+" available",
            expectModuleScopeContain(testParam[0], "module."+ testParam[1]));
        });
        params.forEach(function(testParam) {
          it("'module."+testParam[1]+"' should be same as '"+testParam[1]+"'",
            expectModuleVariablesEqual("module."+ testParam[1], testParam[1]));
        });
      });
    });
  });
});


