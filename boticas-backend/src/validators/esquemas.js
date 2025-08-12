import Joi from 'joi';

export const empresaSchema = Joi.object({
  ruc: Joi.string().length(11).required(),
  razonSocial: Joi.string().max(200).required(),
  rubro: Joi.string().max(100).required(),
  correo: Joi.string().email().required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const ventaSchema = Joi.object({
  idEmpresa: Joi.number().integer().positive().required(),
  tipoComprobante: Joi.string().length(2).required(),
  fechaEmision: Joi.date().iso().required(),
  idCliente: Joi.number().integer().positive().optional(),
  idMoneda: Joi.number().integer().positive().required(),
  idCondicionPago: Joi.number().integer().positive().required(),
  detalle: Joi.array().items(
    Joi.object({
      idProducto: Joi.number().integer().positive().optional(),
      cantidad: Joi.number().integer().min(1).required(),
      precioUnitario: Joi.number().min(0).required()
    })
  ).min(1).required()
});