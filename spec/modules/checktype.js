'use strict';

exports.check = function(name) {
  return eval("typeof "+ name +";");
};

