const qs = require("qs");

module.exports = (queryString) => {
  return qs.parse(queryString);
};
