const Joi = require('joi').extend(require('@joi/date'));

const registerSchema = Joi.object().keys({
    first_name: Joi.string().required().empty(''),
    last_name: Joi.string().required().empty(''),
    email_id: Joi.string().email().required().empty(''),
    password: Joi.string().min(8).max(15).required().empty(''),
})

const exportFileSchema=Joi.object({
    startDate: Joi.date().format('YYYY-MM-DD'),
    endDate: Joi.date().format('YYYY-MM-DD'),
    isActive: Joi.boolean()
}).or('startDate','endDate')

module.exports = {
    registerSchema,
    exportFileSchema
}