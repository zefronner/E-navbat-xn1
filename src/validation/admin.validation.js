import Joi from 'joi';

export const adminValidator = (data) => {
  const admin = Joi.object({
    username: Joi.string().min(4).max(20).required(),
    password: Joi.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      .required(),
  });
  return admin.validate(data);
};
