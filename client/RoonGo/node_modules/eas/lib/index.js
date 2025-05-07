const defaults = require('./defaults');
const Template = require('./template');

function createEngine(source, options = {}) {
  const opts = Object.assign({}, defaults, options);
  const {cache, caches, filename, debug} = opts;
  const canCache = cache && filename && caches;

  if (!debug && canCache && caches.has(filename)) {
    return caches.get(filename);
  }

  const engine = new Template(source, opts);

  if (!debug && canCache) {
    caches.set(filename, engine);
  }

  return engine;
}

function scanArguments(data, options, callback) {
  if (typeof data === "function") {
    callback = data;
    data = {};
  }

  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  return [data, options, callback];
}


function compile(source, options = {}) {
  const engine = createEngine(source, options);
  return engine.compile();
}

function render(source, ...args) {
  const [data, options, callback] = scanArguments(...args);
  const engine = createEngine(source, options);
  return engine.render(data, callback);
}

function readFile(filename, ...args) {
  const [data, options, callback] = scanArguments(...args);
  const opts = Object.assign({}, defaults, options);
  const {cache, caches, debug} = opts;
  const canCache = cache && filename && caches;

  filename = opts.resolve(filename, opts);
  opts.filename = filename;

  if (!debug && canCache && caches.has(filename)) {
    const engine = caches.get(filename);
    return engine.render(data, callback);
  }

  opts.loader(filename, (err, source) => {
    if (err) return callback(err);
    const engine = new Template(source, opts);
    if (!debug && canCache) caches.set(filename, engine);
    engine.render(data, callback);
  });
}


exports.defaults = defaults;
exports.compile = compile;
exports.render = render;
exports.readFile = readFile;
