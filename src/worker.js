(function() {

var RO_ATTRS = ["id", "postForeground", "require"];
var RW_ATTRS = ["exports"];

var modules = {};

function createModule(id) {
  var contextIn = "";
  var contextOut = "";

  function defineReadOnly(key, value) {
    return "Object.defineProperty(module, \""+ key +"\", {\n"+
    "  configurable:false, enumerable:true, settable:false, value:"+value+",\n"+
    "});\n";
  }
  function defineReadWrite(key, get, set) {
    return "Object.defineProperty(module, \""+ key +"\", {\n"+
    "  configurable:false, enumerable:true, get:"+get+", set:"+set+",\n"+
    "});";
  }

  RO_ATTRS.concat(RW_ATTRS).forEach(function(key) {
    contextIn += "var "+ key +" = context[\""+ key +"\"];\n";
    contextOut += "context[\""+ key +"\"] = "+ key +";\n";
  });
  contextIn += "var module = {};\n";
  contextIn += defineReadOnly("module", "module");
  RO_ATTRS.forEach(function(key) {
    contextIn += defineReadOnly(key, key);
  });
  RW_ATTRS.forEach(function(key) {
    contextIn += defineReadWrite(key,
        "function() { return "+ key +"; }",
        "function(arg) { "+ key +" = arg; }"
        );
  });
  contextIn += defineReadOnly("importScripts", "importScripts");
  contextIn += "Object.freeze(module);\n"
  contextIn += importScripts.toString() +"\n";
  contextIn += "var onmessage = undefined;\n";
  contextIn += "var postMessage = undefined;\n";

  var context = {};
  context.id = id;
  context.postForeground = postForeground;
  context.require = require;
  context.exports = {};
  var global = {};

  function runInSandbox(code, args) {
    var body = contextIn +"\n"+
      "("+ code.toString() +").apply(global, args);\n"+
      contextOut;
    var sandbox = Function("global", "context", "args", body);
    sandbox.call(null, global, context, args);
  }
  Object.defineProperty(runInSandbox, "exports", {
    set: throwReadOnly,
    get: function() { return context.exports; },
  });
  return runInSandbox;
}

function require(moduleId) {
  var module = modules[checkModuleId(moduleId)];
  if (!module) {
    modules[moduleId] = module = createModule(moduleId);
    Object.seal(module);
    var url = resolve(moduleId);
    module(function(url) { importScripts(url) }, [url]);
  }
  return module.exports;
}

function postForeground(func) {
  if (typeof func != "function") {
    throw new Error("only functions can be posted to foreground thread ("+
      typeof func +" given)");
  }
  var args = Array.apply(null, arguments);
  args.shift();
  postMessage({ func: func.toString(), args: args, });
}

function throwReadOnly() {
  throw new Error("setting attribute is not allowed");
}

function importScripts() {
  Array.apply(null, arguments).forEach(function(url) {
    eval((function() {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send();
      if (xhr.status !== 200) {
        throw Error(xhr.status + " " + xhr.statusText + ": " + url);
      }
      var code = xhr.responseText;
      return code;
    })());
  });
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

var config;

function resolve(moduleId) {
  // dots and double dots should work out-of-the-box
  return config.moduleBase + moduleId +".js"; 
}

var handleMessage = function(message) {
  config = message;

  var mainModule = createModule("main");
  handleMessage = function(message) {
    mainModule(message.func, message.args);
  };
};

onmessage = function(evt) {
  handleMessage(evt.data);
};

})();

