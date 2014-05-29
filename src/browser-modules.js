
var modularApp = (function() {

var scriptRoot = "/";

if (document.currentScript) {
  scriptRoot = document.currentScript.src.replace(/browser-modules\.js.*/, "");
} else if (document.scripts) {
  for (var i = 0; i < document.scripts.length; ++i) {
    var src = document.scripts[i].src;
    if (src.indexOf("browser-modules.js") != -1) {
      scriptRoot = src.replace(/browser-modules\.js.*/, "");
    }
  }
}

var defaultConfig = {
  workerScript: scriptRoot +"worker.js",
  moduleBase: scriptRoot
}

var global = window;

function createApplication(name, config) {
  var postBackground;
  var terminate;
  var app;

  function onForegroundMessage(code, args) {
    // making some variables invisible
    var config = undefined;
    var onForegroundMessage = undefined;

    eval("("+ code.toString() +").apply(app, args);");
  }

  var config = config || {};
  for (var key in defaultConfig) {
    if (typeof config[key] === "undefined") {
      config[key] = defaultConfig[key];
    }
  }
  var worker = new Worker(config.workerScript);
  worker.postMessage(config);

  postBackground = function(func) {
    if (typeof func != "function") {
      throw new Error("only functions can be posted to background thread ("+
        typeof func +" given)");
    }
    var args = Array.apply(null, arguments);
    args.shift();
    worker.postMessage({ func: func.toString(), args: args });
  }
  worker.onmessage = function(evt) {
    onForegroundMessage(evt.data.func, evt.data.args);
  };
  terminate = function() {
    worker.terminate();
  };
  
  return app = {
    name: name,
    postBackground: postBackground,
    terminate: terminate
  };
}

var api = {};
api.create = createApplication;
api.run = function(func) {
  main = func || function() { module.importScripts("main.js"); };
  if (typeof func != "function") {
    throw new Error(typeof func +" is not a function");
  }
  var app = api.create("main");
  app.postBackground(func);
  return app;
};

return api;

})();

