'use strict';

exports.check = function(name) {
  return typeof eval(name);
};

