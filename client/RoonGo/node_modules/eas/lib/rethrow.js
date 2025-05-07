
module.exports = function rethrow(err, source, line, column, path) {
  const lines = source.split(/\n/);
  const start = Math.max(line - 3, 0);
  const end = Math.min(lines.length, line + 3);
  const characters = String(end).length;

  // Error context
  const context = lines.slice(start, end).map((code, index) => {
    const number = index + start + 1;
    const left = number === line ? ' >> ' : '    ';
    const num = ('    ' + number).slice(-characters);
    return `${left}${num}| ${code}`;
  }).join('\n');

  err.name = 'RuntimeError';
  err.path = path;
  // Alter exception message
  err.message = `${path || 'anonymous'}:${line}:${column}\n` +
    `${context}\n\n` +
    `${name}: ${message}`;

  throw err;
};
