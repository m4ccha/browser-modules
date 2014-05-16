'use strict';

var vm = require("vm");
var fs = require("fs");
var console = require("console");

global.Worker = function(scriptAddress, name) {
  var name = name || "worker";
  var worker = global.Worker.instance = {};
  var queue = worker.messageQueue = [];

  var context = {};
  context.self = context;
  context.onmessage = function() {};
  context.postMessage = function(message) {
    queue.push(function() { worker.onmessage({ data: message }); });
  }
  context.importScripts = function(address) {
    eval.apply(context, [fs.readFileSync(address).toString()]);
  }
  context.location = { href: scriptAddress };
  context.console = console;
  context.XMLHttpRequest = function() {
    var xhr = {};
    var address;

    xhr.open = function(method, url, async) {
      address = "."+ url.substring(url.indexOf("/spec"));
    };
    xhr.send = function() {
      xhr.status = 200;
      xhr.responseText = fs.readFileSync(address).toString();
    };
    return xhr;
  }

  vm.runInNewContext(fs.readFileSync(scriptAddress).toString(), context);

  function logError(e) { console.error("thrown from "+ name +": "+ e); };
  function catchExceptions(func) {
    return function() { try { func(); } catch(e) { logError(e); } };
  };
  worker.postMessage = function(msg) {
    queue.push(catchExceptions(function(){ context.onmessage({ data:msg });}));
  };
  worker.onmessage = function() {};
  worker.terminate = function() {};
  return worker;
}

global.window = global;
global.bmWorkerScriptLocation = "./src/worker.js";

eval.apply(global, [fs.readFileSync("./src/browser-modules.js").toString()]);

module.exports.create = function(name) {
  var app = modularApp.create(name);

  var originalPost = app.postBackground;
  app.postBackground = function() {
    originalPost.apply(app, arguments);

    var queue = Worker.instance.messageQueue;
    while (queue.length) {
      queue.shift()();
    }
  };
  return app;
};

