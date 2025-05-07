function escape(str) {
  return str
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')
    .replace('"', '&#34;')
    .replace("'", '&#39;');
}

class Stdio {
  constructor(filename, initData = []) {
    this.filename = filename;
    this.data = initData;
  }

  output(callback) {
    const output = (out, i) => {
      if (i >= this.data.length) {
        callback(null, out);
        return;
      }

      const chunk = this.data[i];

      if (chunk instanceof Stdio) {
        stdio.output((err, result) => {
          if (err) callback(err);
          else output(out + result, i + 1);
        });
        return;
      }

      // 异步数据
      if (chunk && chunk.__async === true) {
        chunk.reject = err => callback(err);
        chunk.resolve = result => output(out + result, i + 1);
        chunk.execute();
        return;
      }

      output(out + chunk, i + 1);
    };

    output('', 0);
  }

  input(data) {
    this.data.push(data);
    return this;
  }

  escape(data) {
    if (data && data.__async === true) {
      const resolve = data.resolve;
      data.resolve = result => resolve(escape(result));
      return this.input(data);
    }

    return this.input(escape(data));
  }
}

module.exports = Stdio;
