
var modularApp = (function() {

var global = window;
var workerScriptLocation = getWorkerScriptLocation();

function createApplication(name) {
  var postBackground;
  var app;

  function onForegroundMessage(code, args) {
    // making some variables invisible
    var workerScripLocation = undefined;
    var onForegroundMessage = undefined;

    eval("("+ code.toString() +").apply(app, args);");
  }

  var worker = new Worker(workerScriptLocation);
  postBackground = function(func) {
    if (typeof func != "function") {
      throw new Error("only functions can be posted to background thread ("+
        typeof func +" given)");
    }
    var args = Array.prototype.concat.apply([], [arguments]);
    args.shift();
    worker.postMessage({ func: func.toString(), args: args });
  }
  worker.onmessage = function(evt) {
    onForegroundMessage(evt.data.func, evt.data.args);
  };
  
  return app = {
    name: name,
    postBackground: postBackground
  };
}

function getWorkerScriptLocation() {
  if (global.bmWorkerScriptLocation) {
    return global.bmWorkerScriptLocation;
  }
  if (document.currentScript) {
    return document.currentScript.src.replace("browser-modules", "worker");
  }
  if (document.scripts) {
    for (var i = 0; i < document.scripts.length; ++i) {
      var src = document.scripts[i].src;
      if (src.indexOf("browser-modules.js") != -1) {
        return src.replace("browser-modules", "worker");
      }
    }
  }
  throw new Error("can't get address of currently running script");
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

