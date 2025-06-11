module.exports = (req, res, next) => {
  const queryObject = { ...req.query };

  const fields = ["sort", "fields", "page", "limit"];
  fields.forEach((field) => delete queryObject[field]);

  let queryString = JSON.stringify(queryObject);

  queryString = queryString.replace(
    /\b(lt|lte|gt|gte|eq|ne)\b/g,
    (found) => `$${found}`
  );

  const toursQuery = JSON.parse(queryString);

  req.formattedQuery = toursQuery;

  next();
};
