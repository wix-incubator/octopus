module.exports = (out = console) => (name, type, message) => {

  if (type === 'info' && typeof message !== 'undefined') {
    out.log(`[${name}]: ${message}`);
  } else if (type === 'reject') {
    out.error(`[${name}]: failed with ${message.stack}`);
  }
};