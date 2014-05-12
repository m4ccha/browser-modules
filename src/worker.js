var require;

function postForeground(func) {
  if (typeof func != "function") {
    throw new Error("only functions can be posted to foreground thread ("+
      typeof func +" given)");
  }
  var args = Array.prototype.concat.apply([], [arguments]);
  args.shift();
  postMessage({ func: func.toString(), args: args, });
}

function createModule(id) {
  'use strict';

  var module = {};
  function runInContext(code, args) {
    eval("("+ code.toString() +").apply(module, args);");
  }

  function defineReadOnly(key, value) {
    Object.defineProperty(module, key, {
      configurable: false, enumerable: true, writable: false, value: value,
    });
  }
  defineReadOnly("module", module);
  defineReadOnly("id", id);
  defineReadOnly("postForeground", postForeground);
  defineReadOnly("importScripts", importScripts);
  defineReadOnly("require", require);
  defineReadOnly("runInContext", runInContext);

  var exports = {};
  Object.defineProperty(module, "exports", {
    get: function() { return exports; },
    set: function(arg) { exports = arg; },
  });
  Object.seal(module);

  // making some variables invisible
  var postMessage = undefined; 
  var createModule = undefined;
  var global = module;
  var self = module;

  return module;
}

(function() {

var mainModule = createModule("main");
mainModule.config = {
  moduleBaseUrl: "modules/",
}

function resolve(moduleId) {
  // dots and double dots should work out-of-the-box
  return mainModule.config.moduleBaseUrl + moduleId +".js"; 
}

var modules = {};

require = function(moduleId) {
  var module = modules[checkModuleId(moduleId)];
  if (!module) {
    modules[moduleId] = module = createModule(moduleId);
    var url = resolve(moduleId);
    module.runInContext(function(url) { importScripts(url) }, [url]);
  }
  return module.exports;
}

function checkModuleId(moduleId) {
  if (typeof moduleId != "string") {
    throw new Error(typeof moduleId + " is not a valid moduleId");
  }
  if (moduleId.length == 0) {
    throw new Error("empty string is not valid moduleId")
  }
  var terms = moduleId.split("/");
  if (terms[0].matches(/\.\.?/)) {
    terms.shift();
  }
  Array.prototype.forEach.apply(terms, [function(term) {
    if (!term.matches(/[a-z][a-z0-9]*([A-Z][a-z0-9]*)*/)) {
      throw new Error("'"+ moduleId +
        "' is not valid camelCase moduleId ("+ term +")");
    }
  }]);
  return moduleId;
}

onmessage = function(evt) {
  mainModule.runInContext(evt.data.func, evt.data.args);
};

})();

