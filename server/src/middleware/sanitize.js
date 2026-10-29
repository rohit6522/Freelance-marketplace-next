const clean = (value) => {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        clean(value[key]);
      }
    }
  }
};

const sanitizeInput = (req, res, next) => {
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
};

export default sanitizeInput;