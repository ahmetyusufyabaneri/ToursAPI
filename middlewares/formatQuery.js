const formatQuery = (req, res, next) => {
  const queryObject = { ...req.query };

  const params = ["sort", "fields", "page", "limit"];
  params.forEach((param) => delete queryObject[param]);

  let queryString = JSON.stringify(queryObject);

  queryString = queryString.replace(
    /\b(lt|lte|gt|gte|eq|ne)\b/g,
    (found) => `$${found}`
  );

  const toursQuery = JSON.parse(queryString);

  req.formattedQuery = toursQuery;

  next();
};

module.exports = formatQuery;
