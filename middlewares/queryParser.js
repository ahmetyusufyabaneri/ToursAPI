const qs = require("qs");

const queryParser = (queryString) => {
  return qs.parse(queryString);
};

module.exports = queryParser;
