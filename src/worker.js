var require;

function postForeground(func) {
  if (typeof func != "function") {
    throw new Error("only functions can be posted to foreground thread ("+
      typeof func +" given)");
  }
  var args = Array.apply(null, arguments);
  args.shift();
  postMessage({ func: func.toString(), args: args, });
}

function createModule(id) {
  'use strict';

  var module = {};
  var exports = {};

  function importScripts() {
    Array.apply(null, arguments).forEach(function(url) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send();
      if (xhr.status !== 200) {
        throw Error(xhr.status + " " + xhr.statusText + ": " + url);
      }
      var code = xhr.responseText;
      eval(code);
    });
  }
  function runInContext(code, args) {
    // making some variables invisible
    var postMessage = undefined; 
    var createModule = undefined;
    var runInContext = undefined;
    var global = module;
    var self = module;

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

  Object.defineProperty(module, "exports", {
    get: function() { return exports; },
    set: function(arg) { exports = arg; },
  });

  return module;
}

(function() {

var modules = {};

require = function(moduleId) {
  var module = modules[checkModuleId(moduleId)];
  if (!module) {
    modules[moduleId] = module = createModule(moduleId);
    Object.seal(module);
    var url = resolve(moduleId);
    module.runInContext(function(url) { importScripts(url) }, [url]);
  }
  return module.exports;
}

function removeFilePart(url) {
  var end = url.lastIndexOf("/");
  return url.substring(0, end == -1? url.length(): end + 1);
}

var mainModule = createModule("main");
mainModule.config = { moduleBaseUrl: removeFilePart(location.href), }
Object.seal(mainModule);

function resolve(moduleId) {
  // dots and double dots should work out-of-the-box
  return mainModule.config.moduleBaseUrl + moduleId +".js"; 
}

function checkModuleId(moduleId) {
  if (typeof moduleId != "string") {
    throw new Error(typeof moduleId + " is not a valid moduleId");
  }
  if (moduleId.length == 0) {
    throw new Error("empty string is not valid moduleId")
  }
  var terms = moduleId.indexOf("/") != -1? moduleId.split("/"): [moduleId];
  Array.prototype.forEach.apply(terms, [function(term) {
    if (!term.match(/\.\.?|[a-z][a-z0-9]*([A-Z][a-z0-9]*)*/)) {
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

