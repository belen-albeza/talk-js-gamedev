// Require Node modules in the browser thanks to Browserify: http://browserify.org
var bespoke = require('bespoke'),
  cube = require('bespoke-theme-nebula'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
  bullets = require('bespoke-bullets'),
  scale = require('bespoke-scale'),
  hash = require('bespoke-hash'),
  progress = require('bespoke-progress');
  backdrop = require('bespoke-backdrop');

// Bespoke.js
bespoke.from('article', [
  cube(),
  keys(),
  touch(),
  bullets('.bullet, .bullets li'),
  scale(),
  hash(),
  progress(),
  backdrop()
]);

// Prism syntax highlighting
// This is actually loaded from "bower_components" thanks to
// debowerify: https://github.com/eugeneware/debowerify
require('prism');
