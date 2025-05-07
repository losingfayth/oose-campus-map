const {readFile} = require('fs');
const {dirname, resolve, extname} = require('path');

const defaults = {
  delimiters: ['<%', '%>'],
  cache: false,
  client: false,
  compileDebug: false,
  debug: false,
  strict: false,
  with: true,
  root: '/',
  extension: '.ejs',

  loader(filename, callback) {
    readFile(filename, (err, content) => {
      if (!err) content = content.toString();
      callback(err, content);
    });
  },

  resolve(name, opts) {
    const root = this.root;

    if (/^\.+\//.test(name)) {
      const from = opts.filename;
      const self = !from || name === from;
      const base = self ? root : dirname(from);
      name = resolve(base, name);
    } else {
      name = resolve(root, name);
    }

    return !extname(name)
      ? name + this.extension
      : name;
  },

  caches: new Map()
};

module.exports = defaults;
