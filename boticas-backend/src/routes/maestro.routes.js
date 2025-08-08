import { Router } from 'express';
import { body } from 'express-validator';
import { validar } from '../utils/validar.js';
import { autenticar } from '../middlewares/auth.js';
import * as C from '../controllers/maestro.controller.js';

const router = Router();

/* Marcas */
router.get('/marcas',          autenticar, C.listarMarcas);
router.post('/marcas',         autenticar, [body('n').notEmpty()], validar, C.crearMarca);
router.put('/marcas/:id',      autenticar, [body('n').optional().notEmpty()], validar, C.editarMarca);
router.delete('/marcas/:id',   autenticar, C.desactMarca);

/* Laboratorios */
router.get('/laboratorios',    autenticar, C.listarLabs);
router.post('/laboratorios',   autenticar, [body('n').notEmpty(), body('pa').notEmpty()], validar, C.crearLab);
router.put('/laboratorios/:id',autenticar, [body('n').optional().notEmpty()], validar, C.editarLab);
router.delete('/laboratorios/:id', autenticar, C.desactLab);

/* Presentaciones */
router.get('/presentaciones',  autenticar, C.listarPres);
router.post('/presentaciones', autenticar, [body('c').notEmpty(), body('d').notEmpty()], validar, C.crearPres);
router.put('/presentaciones/:id',autenticar, [body('c').optional().notEmpty()], validar, C.editarPres);
router.delete('/presentaciones/:id', autenticar, C.desactPres);

/* Categorías */
router.get('/categorias',     autenticar, C.listarCategorias);
router.post('/categorias',    autenticar, [body('d').notEmpty(), body('t').notEmpty()], validar, C.crearCategoria);
router.put('/categorias/:id', autenticar, [body('d').optional().notEmpty()], validar, C.editarCategoria);
router.delete('/categorias/:id', autenticar, C.desactCategoria);

/* Principios activos */
router.get('/principios',     autenticar, C.listarPrincipios);
router.post('/principios',    autenticar, [body('n').notEmpty(), body('c').notEmpty()], validar, C.crearPrincipio);
router.put('/principios/:id', autenticar, [body('n').optional().notEmpty()], validar, C.editarPrincipio);
router.delete('/principios/:id', autenticar, C.desactPrincipio);

/* Vías de administración */
router.get('/vias',           autenticar, C.listarVias);
router.post('/vias',          autenticar, [body('c').notEmpty(), body('d').notEmpty()], validar, C.crearVia);
router.put('/vias/:id',       autenticar, [body('c').optional().notEmpty()], validar, C.editarVia);
router.delete('/vias/:id',    autenticar, C.desactVia);

export default router;