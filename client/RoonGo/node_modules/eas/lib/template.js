const Asyncify = require('./asyncify');
const rethrow = require('./rethrow');
const Stdio = require('./stdio');
const stringify = JSON.stringify;
const BOM = /^\uFEFF/;

function stripSemi(str) {
  return str.replace(/;(\s*$)/, '$1');
}

// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Writing_a_regular_expression_pattern
function escapeRegExp(string) {
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includeFile(filename, data, opts) {
  return new Asyncify((callback) => {
    opts.loader(filename, (err, content) => {
      if (err) {
        callback(err);
        return;
      }

      try {
        const options = Object.assign({}, opts, {filename, client: true});
        const tpl = new Template(content, options);
        tpl.render(data, callback);
      } catch (e) {
        callback(e);
      }
    });
  });
}

class Template {
  constructor(source, opts) {
    if (opts.strict) {
      opts.with = false;
    } else if (typeof opts.with === "undefined") {
      opts.with = true;
    } else {
      opts.with = !!opts.with;
    }

    this.source = source.replace(BOM, '');
    this.opts = opts;
    this.scripts = [];
  }

  tokenize() {
    const {delimiters, compileDebug} = this.opts;
    const rule = /([#=-]?)[ \t]*([\w\W]*?)[ \t]*(_?)/;
    const pattern = delimiters.map(escapeRegExp).join(rule.source);
    // const reg = /<%([#=-]?)[ \t]*([\w\W]*?)[ \t]*(_?)%>/g;
    const reg = new RegExp(pattern, 'g');

    let chaining = false;
    let cursor = 0;
    let lines = 0;
    let match;

    const append = (str) => {
      if (!chaining) this.scripts.push(str);
      else this.scripts[this.scripts.length - 1] += str;
    };

    if (compileDebug) {
      append(`var __line = 1`);
      append(`var __column = 1`);
    }

    const trimReg = new RegExp('_' + escapeRegExp(delimiters[1] + '[ \\t]*', 'gm'));
    // const source = this.source.replace(/_%>[ \t]*/gm, '_%>');
    const source = this.source.replace(trimReg, '_' + delimiters[1]);

    while (match = reg.exec(source)) {
      const [expr, declare, code, trimMode] = match;

      // 规则前面的字符串
      // ---------------------------------
      let string = source.substring(cursor, match.index);
      if (trimMode) string = string.replace(/\n[ \t]*$/, '');
      if (string !== "") append(`${chaining?'':"$stdio"}.input(${stringify(string)})`);
      if (compileDebug) lines = string.split("\n").length - 1;

      // 规则部分
      // ---------------------------------
      if (compileDebug) {
        lines > 0 && append(`__line += ${lines}`);
        append(`__column = ${expr.substring(expr.lastIndexOf('\n')).length + 1}`);
        lines = expr.split("\n").length - 1;
      }

      chaining = declare === '=' || declare === '-';

      switch (declare) {
        case '#':
          append(`/*${code}*/`);
          break;
        case '=':
        case "-":
          const method = declare === '=' ? 'input' : 'escape';
          append(`${chaining?'':"$stdio"}.${method}(${stripSemi(code)})`);
          break;
        default:
          append(code);
      }

      // 更新指针
      // ---------------------------------
      cursor = match.index + match[0].length;
    }

    const string = source.substring(cursor);
    string !== "" && append(`${chaining?'':"$stdio"}.input(${stringify(string)})`);

    return this;
  }

  generate() {
    const opts = this.opts;
    const {compileDebug, filename} = opts;
    const prepend = [`var __filename = ${stringify(filename)}`];
    const append = [];

    prepend.push();

    // 独立编译函数需要 $stdio 变量
    if (opts.client) {
      // prepend.push(`var $stdio = new (${Stdio.toString()})(__filename)`);
      // append.push(`return $stdio.output()`);
    }

    // with 模式下使用变量
    if (opts.with) {
      prepend.push(`with (this) {`);
      append.unshift(`}`);
    }

    if (compileDebug) {
      prepend.unshift(
        `var __line = 1`,
        `var __column = 1`,
        `var __source = ${stringify(this.source)}`,
        `try {`
      );

      append.push(
        `} catch (err) {`,
        `    $rethrow(err, __source, __line, __column, __filename);`,
        `}`
      );
    }

    if (opts.strict) {
      prepend.unshift(`"use strict"`);
    }

    this.tokenize();

    const renderCode = [
      prepend.join("\n"),
      this.scripts.join("\n"),
      append.join("\n")
    ].join("\n");

    if (opts.debug) {
      console.log(renderCode);
    }

    return renderCode;
  }

  compile() {
    const {opts} = this;
    let factory;

    try {
      const parameters = ['$stdio', "include", '$rethrow'];
      if (!opts.compileDebug) parameters.pop();
      factory = new Function(parameters.join(", "), this.generate());
    } catch (err) {
      if (err instanceof SyntaxError) {
        if (opts.filename) err.message += ' in ' + opts.filename;
        err.message += ' while compiling ejs\n\n';
        err.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
        err.message += 'https://github.com/RyanZim/EJS-Lint';
      }
      throw err;
    }

    if (opts.client) {
      console.log(factory.toString());
      return factory;
    }

    function render(data, customStdio, callback) {
      if (typeof customStdio === "function") {
        callback = customStdio;
        customStdio = null;
      }

      const stdio = customStdio || new Stdio(opts.filename);
      const include = (name, includeData = {}) => {
        const path = opts.resolve(name, opts);
        if (!path) return new Asyncify(cb => cb(new Error(`Template not found "${name}"`)));
        const subData = Object.assign({}, data, includeData);
        const subOpts = Object.assign({}, opts, {filename: path});
        return includeFile(path, subData, subOpts);
      };

      const args = [stdio, include, rethrow];
      if (!opts.compileDebug) args.pop();
      factory.apply(data, args);

      if (!customStdio && typeof callback === "function") {
        return stdio.output(callback);
      }
    }

    return render;
  }

  render(data, callback) {
    this.opts.client = false;
    const render = this.compile();
    render(data, callback);
  }
}

module.exports = Template;
