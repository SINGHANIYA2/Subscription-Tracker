import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] ?? '_';
      if (!fields[key]) fields[key] = issue.message;
    }
    throw new AppError(400, 'VALIDATION_ERROR', 'Please fix the highlighted fields.', fields);
  }
  req.body = result.data;
  next();
};
