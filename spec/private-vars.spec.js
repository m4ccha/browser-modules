'use strict';

var modularApp = require("../compat/node");
var fs = require("fs");

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

    var tokens = (function() {
      var reserved = [
        "break", "do", "in", "typeof", "case", "else", "instanceof", "var",
        "catch", "export", "new", "void", "class", "extends", "return",
        "while", "const", "finally", "super", "with", "continue", "for",
        "switch", "yield", "debugger", "function", "this", "default", "if",
        "throw", "delete", "import", "try", "true", "false", "arguments",
        "self", "null", "location", "eval", "Object", "Array", "Error",
        "XMLHttpRequest", "toString", "module", "id", "exports", "require",
        "importScripts", "postForeground", "Function", "global", "args",
        "context", "url", "name"
      ];

      var code = fs.readFileSync("src/browser-modules.js").toString() +
          fs.readFileSync("src/worker.js").toString();
      var tokens = code.split(/[\s.,{}\[\]()"';:+\-*\/=<>!~?|\\]/);
      tokens = tokens.filter(function(word) {
        return reserved.indexOf(word) === -1 && !word.match("^[0-9.]*$");
      });

      var previous = null;
      return tokens.sort().reduce(function(unique, current) {
        if (previous !== current) {
          unique.push(current);
        }
        previous = current;
        return unique;
      }, []);
    })();

    describe("when in bg code", function() {
      tokens.forEach(function(word) {
        it("'"+ word +"' is undefined", function(done) {
          global.fixture.done = function(arg) {
            expect(arg).toBe("undefined");
            done();
          };
          app.postBackground(function(word) {
            var check = require("../spec/modules/checktype").check;
            var type = check(word);
            postForeground(function(arg) { global.fixture.done(arg); }, type);
          }, word);
        });
      });

      describe("when inside a module", function() {
        tokens.forEach(function(word) {
          it("'"+ word +"' is undefined", function(done) {
            global.fixture.done = function(arg) {
              expect(arg).toBe("undefined");
              done();
            };
            app.postBackground(function(word) {
              var _eval = require("../spec/modules/eval");
              _eval("var check = require(\"../spec/modules/checktype\").check;"+
              "var type = check(\""+ word +"\");"+
              "postForeground(function(arg) {\n"+
              "  global.fixture.done(arg);\n"+
              "}, type);");
            }, word);
          });
        });
      });
    });
  });
});


