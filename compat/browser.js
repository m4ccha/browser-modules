'use strict';

window.require = function(moduleId) {
  if (moduleId == "fs") {
    return {
      readFileSync : function(fileName) {
        var url = "../"+ fileName;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.status !== 200) {
          throw Error(xhr.status + " " + xhr.statusText + ": " + url);
        }
        var code = xhr.responseText;
        return code
      }
    };
  }
  return window.modularApp;
}

window.global = window;

