import Joi from 'joi';

export const patientValidator = (data) => {
  const patient = Joi.object({
    fullName: Joi.string().required(),
    phoneNumber: Joi.string()
      .pattern(/^(\+998|998)(9[0-9]|3[3]|8[8])[0-9]{7}$/)
      .required(),
    password: Joi.string().min(6).max(30).required(),
    address: Joi.string().required(),
    age: Joi.number().required(),
    gender: Joi.string().valid('male', 'female').required(),
  });
  return patient.validate(data);
};
