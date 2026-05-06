module.exports = new Proxy({}, { get: (_, prop) => prop });
