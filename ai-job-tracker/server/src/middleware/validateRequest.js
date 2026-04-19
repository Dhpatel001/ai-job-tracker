/**
 * Generic Zod validation middleware.
 * Pass in any Zod schema that validates { body, params, query }.
 * If validation fails → structured 400 error, request never reaches the controller.
 *
 * Usage:
 *   router.post("/", validate(createJobSchema), jobController.create);
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    // Flatten Zod errors into a readable array
    const errors = result.error.errors.map((e) => ({
      field: e.path.slice(1).join("."), // strip the leading "body"/"params"/"query"
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: errors,
      },
    });
  }

  // Attach parsed (and coerced) values back onto req
  // This means req.query.page is now a Number, not a String — after the schema ran
  if (result.data.body)   req.body   = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query)  req.query  = result.data.query;

  next();
};
