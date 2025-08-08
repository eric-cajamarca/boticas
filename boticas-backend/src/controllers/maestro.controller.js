import sql from "mssql";
import { pool } from "../config/db.js";

/* ---------- MARCAS ---------- */
export const listarMarcas = async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT * FROM Marcas");
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};
export const crearMarca = async (req, res, next) => {
  const { n, ef, p, sw } = req.body;
  try {
    await pool
      .request()
      .input("n", n)
      .input("ef", ef)
      .input("p", p)
      .input("sw", sw)
      .query(
        "INSERT INTO Marcas (Nombre,PaisOrigen,EsFarmaceutica,SitioWeb) VALUES (@n,@p,@sw,@ef)"
      );

    res.json({ msg: "Marca creada" });
  } catch (e) {
    next(e);
  }
};
export const editarMarca = async (req, res, next) => {
  const { id } = req.params;
  const { n, ef, p, sw } = req.body;
  console.log(req.body);
  await pool
    .request()
    .input("id", id)
    .input("n", n)
    .input("ef", ef)
    .input("p", p)
    .input("sw", sw)

    .query(
      "UPDATE Marcas SET Nombre=@n,PaisOrigen=@p,EsFarmaceutica=@ef,SitioWeb=@sw WHERE idMarca=@id"
    );
  res.json({ msg: "Marca actualizada" });
};
export const desactMarca = async (req, res, next) => {
  await pool
    .request()
    .input("id", req.params.id)
    .query("DELETE FROM Marcas WHERE idMarca=@id");
  res.json({ msg: "Marca eliminada" });
};

/* ---------- LABORATORIOS ---------- */
export const listarLabs = async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT * FROM Laboratorios");
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};
export const crearLab = async (req, res, next) => {
  const { n, r, d, pa, c, tel, ef } = req.body;
  try {
    await pool
      .request()
      .input("n", n)
      .input("pa", pa)
      .input("r", r)
      .input("d", d)
      .input("c", c)
      .input("tel", tel)
      .input("ef", ef)
      .query(
        "INSERT INTO Laboratorios (Nombre,Pais,Direccion,Ruc,Contacto,Telefono,EsFarmaceutico) VALUES (@n,@pa,@d,@r,@c,@tel,@ef)"
      );

    res.json({ msg: "Laboratorio creado" });
  } catch (e) {
    next(e);
  }
};
export const editarLab = async (req, res, next) => {
  const { id } = req.params;
  const { n, r, d, pa, c, tel, ef } = req.body;
  await pool
    .request()
    .input("id", id)
    .input("n", n)
    .input("pa", pa)
    .input("r", r)
    .input("d", d)
    .input("c", c)
    .input("tel", tel)
    .input("ef", ef)
    .query(
      "UPDATE Laboratorios SET Nombre=@n,Pais=@pa,Direccion=@d,Ruc=@r,Contacto=@c,Telefono=@tel,EsFarmaceutico=@ef WHERE idLaboratorio=@id"
    );
  res.json({ msg: "Laboratorio actualizado" });
};
export const desactLab = async (req, res, next) => {
  await pool
    .request()
    .input("id", req.params.id)
    .query("DELETE FROM Laboratorios WHERE idLaboratorio=@id");
  res.json({ msg: "Laboratorio eliminado" });
};

/* ---------- PRESENTACIONES ---------- */
export const listarPres = async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT * FROM Presentaciones");
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};
export const crearPres = async (req, res, next) => {
  const { c, d, m, u, rc, ed } = req.body;
  try {
    await pool
      .request()
      .input("c", c)
      .input("d", d)
      .input("m", m)
      .input("u", u)
      .input("rc", rc)
      .input("ed", ed)
      .query(
        "INSERT INTO Presentaciones (Codigo,Descripcion,Multiplicador,UnidadBase,RequiereControl,EsDosis) VALUES (@c,@d,@m,@u,@rc,@ed)"
      );
    res.json({ msg: "Presentación creada" });
  } catch (e) {
    next(e);
  }
};
export const editarPres = async (req, res, next) => {
  const { id } = req.params;
  const { c, d, m, u, rc, ed } = req.body;
  await pool
    .request()
    .input("id", id)
    .input("c", c)
    .input("d", d)
    .input("m", m)
    .input("u", u)
    .input("rc", rc)
    .input("ed", ed)
    .query(
      "UPDATE Presentaciones SET Codigo=@c,Descripcion=@d,Multiplicador=@m,UnidadBase=@u,RequiereControl=@rc,EsDosis=@ed WHERE idPresentacion=@id"
    );
  res.json({ msg: "Presentación actualizada" });
};
export const desactPres = async (req, res, next) => {
  await pool
    .request()
    .input("id", req.params.id)
    .query("DELETE FROM Presentaciones WHERE idPresentacion=@id");
  res.json({ msg: "Presentación eliminada" });
};

/* ---------- CATEGORÍAS ---------- */
export const listarCategorias = async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT * FROM Categorias");
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};
export const crearCategoria = async (req, res, next) => {
  const { d, t, may, cli, tra, reqr, cont } = req.body;
  try {
    await pool
      .request()
      .input("d", d)
      .input("t", t)
      .input("may", may)
      .input("cli", cli)
      .input("tra", tra)
      .input("reqr", reqr)
      .input("cont", cont)
      .query(
        "INSERT INTO Categorias (Descripcion,Tipo,Mayorista,Cliente,Transeunte,RequiereReceta,Controlado) VALUES (@d,@t,@may,@cli,@tra,@reqr,@cont)"
      );
    res.json({ msg: "Categoría creada" });
  } catch (e) {
    next(e);
  }
};
export const editarCategoria = async (req, res, next) => {
  const { id } = req.params;
  const {  d, t, may, cli, tra, reqr, cont  } = req.body;
  await pool
    .request()
    .input("id", id)
    .input("d", d)
    .input("t", t)
    .input("may", may)
    .input("cli", cli)
    .input("tra", tra)
    .input("reqr", reqr)
    .input("cont", cont)
    .query(
      "UPDATE Categorias SET Descripcion=@d,Tipo=@t,Mayorista=@may,Cliente=@cli,Transeunte=@tra,RequiereReceta=@reqr,Controlado=@cont WHERE idCategoria=@id"
    );
  res.json({ msg: "Categoría actualizada" });
};
export const desactCategoria = async (req, res, next) => {
  await pool
    .request()
    .input("id", req.params.id)
    .query("DELETE FROM Categorias WHERE idCategoria=@id");
  res.json({ msg: "Categoría eliminada" });
};

/* ---------- PRINCIPIOS ACTIVOS ---------- */
export const listarPrincipios = async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT * FROM PrincipiosActivos");
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};
export const crearPrincipio = async (req, res, next) => {
  const { n, c, desc, cont } = req.body;
  try {
    await pool
      .request()
      .input("n", n)
      .input("c", c)
      .input("desc", desc)
      .input("cont", cont)
      .query(
        "INSERT INTO PrincipiosActivos (Nombre,Concentracion,Descripcion,Contraindicaciones) VALUES (@n,@c,@desc,@cont)"
      );
    res.json({ msg: "Principio activo creado" });
  } catch (e) {
    next(e);
  }
};
export const editarPrincipio = async (req, res, next) => {
  const { id } = req.params;
  const { n, c, desc, cont } = req.body;
  await pool
    .request()
    .input("id", id)
    .input("n", n)
    .input("c", c)
    .input("desc", desc)
    .input("cont", cont)
    .query(
      "UPDATE PrincipiosActivos SET Nombre=@n,Concentracion=@c,Descripcion=@desc,Contraindicaciones=@cont WHERE idPrincipioActivo=@id"
    );
  res.json({ msg: "Principio actualizado" });
};
export const desactPrincipio = async (req, res, next) => {
  await pool
    .request()
    .input("id", req.params.id)
    .query("DELETE FROM PrincipiosActivos WHERE idPrincipioActivo=@id");
  res.json({ msg: "Principio eliminado" });
};

/* ---------- VÍAS DE ADMINISTRACIÓN ---------- */
export const listarVias = async (_req, res, next) => {
  try {
    const r = await pool.query("SELECT * FROM ViaAdministracion");
    res.json(r.recordset);
  } catch (e) {
    next(e);
  }
};
export const crearVia = async (req, res, next) => {
  const { c, d, i } = req.body;
  try {
    await pool
      .request()
      .input("c", c)
      .input("d", d)
      .input("i", i)
      .query(
        "INSERT INTO ViaAdministracion (Codigo,Descripcion,Instrucciones) VALUES (@c,@d,@i)"
      );
    res.json({ msg: "Vía creada" });
  } catch (e) {
    next(e);
  }
};
export const editarVia = async (req, res, next) => {
  const { id } = req.params;
  const { c, d, i } = req.body;
  await pool
    .request()
    .input("id", id)
    .input("c", c)
    .input("d", d)
    .input("i", i)
    .query(
      "UPDATE ViaAdministracion SET Codigo=@c,Descripcion=@d,Instrucciones=@i WHERE idVia=@id"
    );
  res.json({ msg: "Vía actualizada" });
};
export const desactVia = async (req, res, next) => {
  await pool
    .request()
    .input("id", req.params.id)
    .query("DELETE FROM ViaAdministracion WHERE idVia=@id");
  res.json({ msg: "Vía eliminada" });
};
