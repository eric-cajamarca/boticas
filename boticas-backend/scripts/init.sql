-- Verificar si la base de datos existe antes de crearla
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BdBotica')
BEGIN
    CREATE DATABASE BdBotica;
    PRINT 'Base de datos BdBotica creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos BdBotica ya existe.';
END
GO

USE BdBotica;
GO

-- ===========================================
-- TABLAS MAESTRAS GENERALES
-- ===========================================

-- Tabla de empresas mejorada con campos para rubro farmacéutico
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Empresa')
BEGIN
    CREATE TABLE Empresa (
        idEmpresa INT IDENTITY PRIMARY KEY,
        Ruc VARCHAR(11) NOT NULL UNIQUE,
        Razon_Social VARCHAR(200) NOT NULL,
        Rubro VARCHAR(100) NOT NULL,  -- Ej: "Farmacéutico", "Distribuidor médico"
        Direccion VARCHAR(200),
        Distrito VARCHAR(50),
        Region VARCHAR(50),
        Provincia VARCHAR(50),
        Celular VARCHAR(11),
        Whatsapp VARCHAR(11),
        Correo VARCHAR(100),
        Logo VARCHAR(200),
        Alias VARCHAR(29),
        -- Campos específicos para farmacias:
        LicenciaSanitaria VARCHAR(50),
        ResponsableTecnico VARCHAR(100),
        HorarioAtencion VARCHAR(100),
        Activo BIT NOT NULL DEFAULT 1
    );
    PRINT 'Tabla Empresa creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Empresa ya existe.';
END
GO

-- Tabla de super usuarios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'superUser')
BEGIN
    CREATE TABLE superUser (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        rol NVARCHAR(20) NOT NULL DEFAULT 'admin',
        fecha_creacion DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
    PRINT 'Tabla superUser creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla superUser ya existe.';
END
GO

-- Tabla de ubicaciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ubicaciones')
BEGIN
    CREATE TABLE Ubicaciones (
        idUbicacion INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(10) UNIQUE,
        Descripcion VARCHAR(50),
        idEmpresa INT REFERENCES Empresa(idEmpresa)
    );
    PRINT 'Tabla Ubicaciones creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Ubicaciones ya existe.';
END
GO

-- Tabla de marcas con mejora para productos farmacéuticos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Marcas')
BEGIN
    CREATE TABLE Marcas (
        idMarca INT IDENTITY PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL UNIQUE,
        EsFarmaceutica BIT DEFAULT 1,  -- 1 para marcas de medicamentos
        PaisOrigen VARCHAR(50),
        SitioWeb VARCHAR(100)
    );
    PRINT 'Tabla Marcas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Marcas ya existe.';
END
GO

-- Tabla de laboratorios mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Laboratorios')
BEGIN
    CREATE TABLE Laboratorios (
        idLaboratorio INT IDENTITY PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL UNIQUE,
        Ruc VARCHAR(11),
        Direccion VARCHAR(200),
        Pais VARCHAR(50) NOT NULL,
        Contacto VARCHAR(100),
        Telefono VARCHAR(15),
        EsFarmaceutico BIT DEFAULT 1
    );
    PRINT 'Tabla Laboratorios creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Laboratorios ya existe.';
END
GO

-- Tabla de presentaciones con unidades médicas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Presentaciones')
BEGIN
    CREATE TABLE Presentaciones (
        idPresentacion INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(5) NOT NULL UNIQUE,  -- Código SUNAT/UNSPSC
        Descripcion VARCHAR(50) NOT NULL,
        Multiplicador INT NOT NULL DEFAULT 1,
        UnidadBase VARCHAR(20),  -- mg, ml, UI, etc.
        -- Campos para control farmacéutico:
        RequiereControl BIT DEFAULT 0,
        EsDosis BIT DEFAULT 0
    );
    PRINT 'Tabla Presentaciones creada exitosamente.';
    
    -- Insertar presentaciones estándar con unidades médicas solo si no existen
    IF NOT EXISTS (SELECT 1 FROM Presentaciones WHERE Codigo = 'BG')
    BEGIN
        INSERT INTO Presentaciones VALUES 
        ('BG','Bolsa',1,'g',0,0),
        ('CEN','Ciento',100,NULL,0,0),
        ('MIL','Millar',1000,NULL,0,0),
        ('BX','Caja',1,NULL,0,0),
        ('WG','Galón',1,'ml',0,0),
        ('MTR','Metros',1,'m',0,0),
        ('KGM','Kilogramo',1,'g',0,0),
        ('LTR','Litro',1,'ml',0,0),
        ('NIU','Unidad',1,NULL,0,0),
        ('DZN','Docena',12,NULL,0,0),
        ('TNE','Tonelada',1,'g',0,0),
        ('PK','Paquete',1,NULL,0,0),
        ('SA','Saco',1,'g',0,0),
        ('BO','Botella',1,'ml',0,0),
        ('TAB','Tableta',1,'mg',1,1),
        ('CAP','Cápsula',1,'mg',1,1),
        ('AMP','Ampolla',1,'ml',1,0),
        ('JRB','Jarabe',1,'ml',1,0),
        ('CRE','Crema',1,'g',1,0),
        ('OVL','Óvulo',1,NULL,1,0);
        PRINT 'Datos iniciales insertados en Presentaciones.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en Presentaciones.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Presentaciones ya existe.';
END
GO

-- Tabla de categorías mejorada para rubro farmacéutico
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categorias')
BEGIN
    CREATE TABLE Categorias (
        idCategoria INT IDENTITY PRIMARY KEY,
        Descripcion VARCHAR(200) NOT NULL,
        Tipo VARCHAR(50) NOT NULL,  -- Medicamento, Insumo Médico, Cosmético, etc.
        -- Porcentajes de descuento por tipo de cliente:
        Mayorista DECIMAL(5,2) DEFAULT 0,
        Cliente DECIMAL(5,2) DEFAULT 0,
        Transeunte DECIMAL(5,2) DEFAULT 0,
        -- Control farmacéutico:
        RequiereReceta BIT DEFAULT 0,
        Controlado BIT DEFAULT 0
    );
    PRINT 'Tabla Categorias creada exitosamente.';
    
    -- Insertar categorías típicas de farmacia solo si no existen
    IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Descripcion = 'Analgésicos')
    BEGIN
        INSERT INTO Categorias VALUES 
        ('Analgésicos','Medicamento',10,5,0,0,0),
        ('Antibióticos','Medicamento',8,3,0,1,0),
        ('Antihipertensivos','Medicamento',5,0,0,1,0),
        ('Psicotrópicos','Medicamento',0,0,0,1,1),
        ('Cuidado Personal','Cosmético',15,10,5,0,0),
        ('Insumos Médicos','Insumo',12,8,5,0,0);
        PRINT 'Datos iniciales insertados en Categorias.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en Categorias.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Categorias ya existe.';
END
GO

-- Tabla de principios activos para medicamentos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrincipiosActivos')
BEGIN
    CREATE TABLE PrincipiosActivos (
        idPrincipioActivo INT IDENTITY PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL UNIQUE,
        Concentracion VARCHAR(20),  -- Ej: "500mg", "10%"
        Descripcion VARCHAR(500),
        Contraindicaciones VARCHAR(500)
    );
    PRINT 'Tabla PrincipiosActivos creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla PrincipiosActivos ya existe.';
END
GO

-- Tabla de vías de administración
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ViaAdministracion')
BEGIN
    CREATE TABLE ViaAdministracion (
        idVia INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(10) NOT NULL UNIQUE,
        Descripcion VARCHAR(50) NOT NULL,
        Instrucciones VARCHAR(200)
    );
    PRINT 'Tabla ViaAdministracion creada exitosamente.';
    
    -- Insertar vías de administración solo si no existen
    IF NOT EXISTS (SELECT 1 FROM ViaAdministracion WHERE Codigo = 'ORAL')
    BEGIN
        INSERT INTO ViaAdministracion VALUES
        ('ORAL','Vía Oral','Tomar con agua'),
        ('TOP','Vía Tópica','Aplicar en la zona afectada'),
        ('INH','Inhalación','Usar inhalador según indicaciones'),
        ('INJ','Inyección','Administrar por personal calificado'),
        ('REC','Rectal','Introducir suavemente'),
        ('OPT','Oftálmica','Aplicar en el ojo');
        PRINT 'Datos iniciales insertados en ViaAdministracion.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en ViaAdministracion.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla ViaAdministracion ya existe.';
END
GO

-- ===========================================
-- TABLAS DE PRODUCTOS E INVENTARIO
-- ===========================================

-- Tabla de productos completamente rediseñada para farmacia
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productos')
BEGIN
    CREATE TABLE Productos (
        idProducto INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        Codigo VARCHAR(20) NOT NULL UNIQUE,
        CodigoBarras VARCHAR(50),
        Nombre VARCHAR(100) NOT NULL,
        Descripcion VARCHAR(255),
        -- Relaciones mejoradas:
        idCategoria INT NOT NULL REFERENCES Categorias(idCategoria),
        idPresentacion INT NOT NULL REFERENCES Presentaciones(idPresentacion),
        idMarca INT REFERENCES Marcas(idMarca),
        idLaboratorio INT REFERENCES Laboratorios(idLaboratorio),
        idPrincipioActivo INT REFERENCES PrincipiosActivos(idPrincipioActivo),
        idViaAdministracion INT REFERENCES ViaAdministracion(idVia),
        -- Información de precios:
        PrecioCompra MONEY NOT NULL CHECK (PrecioCompra >= 0),
        PrecioVenta MONEY NOT NULL CHECK (PrecioVenta >= 0),
        -- Control de inventario:
        StockMin INT NOT NULL DEFAULT 0,
        StockMax INT,
        -- Información farmacéutica:
        Concentracion VARCHAR(20),  -- Ej: "500mg/tableta"
        FormaFarmaceutica VARCHAR(50),
        RegistroSanitario VARCHAR(50),
        Digemid VARCHAR(20),
        RequiereReceta BIT DEFAULT 0,
        Controlado BIT DEFAULT 0,
        -- Auditoría:
        FechaIngreso DATE DEFAULT GETDATE(),
        idUsuario INT NOT NULL,
        Activo BIT DEFAULT 1,
        -- Índices para mejorar performance:
        CONSTRAINT UQ_CodigoEmpresa UNIQUE (idEmpresa, Codigo)
    );
    PRINT 'Tabla Productos creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Productos ya existe.';
END
GO

-- Tabla de lotes mejorada con controles farmacéuticos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Lotes')
BEGIN
    CREATE TABLE Lotes (
        idLote INT IDENTITY PRIMARY KEY,
        idProducto INT NOT NULL REFERENCES Productos(idProducto),
        NumeroLote VARCHAR(50) NOT NULL,
        FechaFabricacion DATE,
        FechaVencimiento DATE NOT NULL,
        Cantidad INT NOT NULL CHECK (Cantidad >= 0),
        -- Control de calidad:
        Estado VARCHAR(20) DEFAULT 'Disponible',  -- Disponible, Cuarentena, Descartado
        Observaciones VARCHAR(200),
        -- Auditoría:
        idUbicacion INT NULL,
        FechaRegistro DATETIME DEFAULT GETDATE(),
        idUsuario INT NOT NULL,
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_ProductoLote UNIQUE (idProducto, NumeroLote)
    );
    
    -- Agregar la FK a Ubicaciones después de crear la tabla
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Lotes_Ubicacion')
    BEGIN
        ALTER TABLE Lotes
        ADD CONSTRAINT FK_Lotes_Ubicacion FOREIGN KEY (idUbicacion) REFERENCES Ubicaciones(idUbicacion);
    END
    
    PRINT 'Tabla Lotes creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Lotes ya existe.';
    
    -- Verificar si la FK existe y agregarla si no
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Lotes_Ubicacion')
    BEGIN
        ALTER TABLE Lotes
        ADD CONSTRAINT FK_Lotes_Ubicacion FOREIGN KEY (idUbicacion) REFERENCES Ubicaciones(idUbicacion);
        PRINT 'Restricción FK_Lotes_Ubicacion agregada a Lotes.';
    END
END
GO

-- Tabla de inventario con más detalles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inventario')
BEGIN
    CREATE TABLE Inventario (
        idInventario INT IDENTITY PRIMARY KEY,
        idProducto INT NOT NULL REFERENCES Productos(idProducto),
        idLote INT NULL REFERENCES Lotes(idLote),
        Tipo CHAR(1) NOT NULL CHECK (Tipo IN ('I','O','A')),  -- I=Ingreso, O=Salida, A=Ajuste
        Cantidad INT NOT NULL CHECK (Cantidad <> 0),
        Fecha DATETIME DEFAULT GETDATE(),
        idUsuario INT NOT NULL,
        idUbicacion INT NULL,
        Observacion VARCHAR(255),
        Referencia VARCHAR(50),  -- N° documento relacionado
        -- Campos para trazabilidad:
        idOrigen INT,  -- ID de compra, venta, etc.
        TipoOrigen VARCHAR(20)  -- 'COMPRA', 'VENTA', 'AJUSTE'
    );
    
    -- Agregar la FK a Ubicaciones después de crear la tabla
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inventario_Ubicacion')
    BEGIN
        ALTER TABLE Inventario
        ADD CONSTRAINT FK_Inventario_Ubicacion FOREIGN KEY (idUbicacion) REFERENCES Ubicaciones(idUbicacion);
    END
    
    PRINT 'Tabla Inventario creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Inventario ya existe.';
    
    -- Verificar si la FK existe y agregarla si no
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inventario_Ubicacion')
    BEGIN
        ALTER TABLE Inventario
        ADD CONSTRAINT FK_Inventario_Ubicacion FOREIGN KEY (idUbicacion) REFERENCES Ubicaciones(idUbicacion);
        PRINT 'Restricción FK_Inventario_Ubicacion agregada a Inventario.';
    END
END
GO

-- ===========================================
-- TABLAS DE PERSONAS (CLIENTES, PROVEEDORES, EMPLEADOS)
-- ===========================================

-- Tabla de tipos de documento mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TiposDocumento')
BEGIN
    CREATE TABLE TiposDocumento (
        Codigo CHAR(2) PRIMARY KEY,
        Nombre VARCHAR(20) NOT NULL,
        Descripcion VARCHAR(200),
        Longitud INT NOT NULL,  -- Longitud esperada del número
        EsPersonaNatural BIT NOT NULL  -- Para diferenciar DNI de RUC
    );
    PRINT 'Tabla TiposDocumento creada exitosamente.';
    
    -- Insertar tipos de documento solo si no existen
    IF NOT EXISTS (SELECT 1 FROM TiposDocumento WHERE Codigo = '01')
    BEGIN
        INSERT INTO TiposDocumento VALUES 
        ('01','DNI','Documento Nacional de Identidad',8,1),
        ('06','RUC','Registro Único de Contribuyentes',11,0),
        ('04','CE','Carné de Extranjería',12,1),
        ('07','PAS','Pasaporte',12,1),
        ('A','CDI','Cédula Diplomática de Identidad',12,1);
        PRINT 'Datos iniciales insertados en TiposDocumento.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en TiposDocumento.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla TiposDocumento ya existe.';
END
GO

-- Tabla de clientes mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clientes')
BEGIN
    CREATE TABLE Clientes (
        idCliente INT IDENTITY PRIMARY KEY,
        TipoDocumento CHAR(2) NOT NULL REFERENCES TiposDocumento(Codigo),
        NumeroDocumento VARCHAR(12) NOT NULL,
        RazonSocial VARCHAR(200) NOT NULL,
        NombreComercial VARCHAR(200),
        Direccion VARCHAR(200),
        Ubigeo CHAR(6),
        Distrito VARCHAR(50),
        Provincia VARCHAR(50),
        Departamento VARCHAR(50),
        Telefono VARCHAR(15),
        Celular VARCHAR(15),
        Correo VARCHAR(100),
        -- Campos específicos para farmacias:
        TipoSeguro VARCHAR(50),  -- SIS, EsSalud, Privado, etc.
        NumeroAfiliacion VARCHAR(50),
        -- Historial:
        FechaRegistro DATE DEFAULT GETDATE(),
        Record DECIMAL(18,2) DEFAULT 0,
        Activo BIT DEFAULT 1,
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_ClienteDocumento UNIQUE (TipoDocumento, NumeroDocumento)
    );
    PRINT 'Tabla Clientes creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Clientes ya existe.';
END
GO

-- Tabla de proveedores mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Proveedores')
BEGIN
    CREATE TABLE Proveedores (
        idProveedor INT IDENTITY PRIMARY KEY,
        TipoDocumento CHAR(2) NOT NULL REFERENCES TiposDocumento(Codigo),
        NumeroDocumento VARCHAR(12) NOT NULL,
        RazonSocial VARCHAR(200) NOT NULL,
        NombreComercial VARCHAR(200),
        Direccion VARCHAR(200),
        Ubigeo CHAR(6),
        Distrito VARCHAR(50),
        Provincia VARCHAR(50),
        Departamento VARCHAR(50),
        Telefono VARCHAR(15),
        Celular VARCHAR(15),
        Correo VARCHAR(100),
        -- Campos específicos:
        TipoProveedor VARCHAR(50),  -- Farmacéutico, Insumos, etc.
        Contacto VARCHAR(100),
        -- Historial:
        FechaRegistro DATE DEFAULT GETDATE(),
        RecordVentas DECIMAL(18,2) DEFAULT 0,
        Activo BIT DEFAULT 1,
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_ProveedorDocumento UNIQUE (TipoDocumento, NumeroDocumento)
    );
    PRINT 'Tabla Proveedores creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Proveedores ya existe.';
END
GO

-- Tabla de puestos mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Puestos')
BEGIN
    CREATE TABLE Puestos (
        idPuesto INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(10) NOT NULL UNIQUE,
        Descripcion VARCHAR(50) NOT NULL,
        NivelAcceso INT NOT NULL DEFAULT 1,
        EsFarmaceutico BIT DEFAULT 0  -- Para identificar puestos que requieren colegiatura
    );
    PRINT 'Tabla Puestos creada exitosamente.';
    
    -- Insertar puestos solo si no existen
    IF NOT EXISTS (SELECT 1 FROM Puestos WHERE Codigo = 'TEC')
    BEGIN
        INSERT INTO Puestos VALUES 
        ('TEC','Técnico de Farmacia',2,1),
        ('FARM','Farmacéutico',3,1),
        ('ADM','Administrativo',2,0),
        ('VEN','Vendedor',1,0),
        ('GER','Gerente',4,0),
        ('ALM','Almacenero',1,0);
        PRINT 'Datos iniciales insertados en Puestos.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en Puestos.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Puestos ya existe.';
END
GO

-- Tabla de empleados mejorada con campos para personal de salud
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Empleados')
BEGIN
    CREATE TABLE Empleados (
        idEmpleado INT IDENTITY PRIMARY KEY,
        TipoDocumento CHAR(2) NOT NULL REFERENCES TiposDocumento(Codigo),
        NumeroDocumento VARCHAR(12) NOT NULL UNIQUE,
        Nombres VARCHAR(50) NOT NULL,
        Apellidos VARCHAR(100) NOT NULL,
        FechaNacimiento DATE,
        Genero CHAR(1),
        Direccion VARCHAR(200),
        Telefono VARCHAR(15),
        Celular VARCHAR(15),
        Correo VARCHAR(100),
        -- Datos laborales:
        idPuesto INT NOT NULL REFERENCES Puestos(idPuesto),
        FechaIngreso DATE NOT NULL,
        FechaCese DATE,
        -- Campos para personal de salud:
        Colegiatura VARCHAR(20),
        Especialidad VARCHAR(50),
        -- Auditoría:
        Activo BIT DEFAULT 1,
        CONSTRAINT UQ_EmpleadoDocumento UNIQUE (TipoDocumento, NumeroDocumento)
    );
    PRINT 'Tabla Empleados creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Empleados ya existe.';
END
GO

-- Tabla de usuarios con seguridad mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        idUsuario INT IDENTITY PRIMARY KEY,
        idEmpleado INT NOT NULL REFERENCES Empleados(idEmpleado),
        Usuario VARCHAR(20) NOT NULL UNIQUE,
        ContrasenaHash VARCHAR(128) NOT NULL,  -- Almacenar hash, no contraseña en texto plano
        Salt VARCHAR(50) NOT NULL,
        -- Control de acceso:
        FechaCreacion DATETIME DEFAULT GETDATE(),
        FechaUltimoAcceso DATETIME,
        IntentosFallidos INT DEFAULT 0,
        Bloqueado BIT DEFAULT 0,
        -- Restablecimiento de contraseña:
        TokenRestablecimiento VARCHAR(50),
        FechaExpiracionToken DATETIME
    );
    PRINT 'Tabla Usuarios creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Usuarios ya existe.';
END
GO

-- Tabla de permisos mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permisos')
BEGIN
    CREATE TABLE Permisos (
        idPermiso INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(20) NOT NULL UNIQUE,
        Nombre VARCHAR(50) NOT NULL,
        Descripcion VARCHAR(200),
        Nivel INT NOT NULL DEFAULT 1
    );
    PRINT 'Tabla Permisos creada exitosamente.';
    
    -- Insertar permisos solo si no existen
    IF NOT EXISTS (SELECT 1 FROM Permisos WHERE Codigo = 'ADMIN')
    BEGIN
        INSERT INTO Permisos VALUES 
        ('ADMIN','Administrador','Acceso total al sistema',4),
        ('FARMACIA','Gestión Farmacia','Módulo de farmacia',3),
        ('VENTAS','Ventas','Módulo de ventas',2),
        ('COMPRAS','Compras','Módulo de compras',2),
        ('INVENTARIO','Inventario','Módulo de inventario',2),
        ('REPORTES','Reportes','Generación de reportes',2);
        PRINT 'Datos iniciales insertados en Permisos.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en Permisos.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Permisos ya existe.';
END
GO

-- Tabla de asignación de permisos a usuarios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UsuarioPermisos')
BEGIN
    CREATE TABLE UsuarioPermisos (
        idUsuarioPermiso INT IDENTITY PRIMARY KEY,
        idUsuario INT NOT NULL REFERENCES Usuarios(idUsuario),
        idPermiso INT NOT NULL REFERENCES Permisos(idPermiso),
        FechaAsignacion DATE DEFAULT GETDATE(),
        AsignadoPor INT REFERENCES Usuarios(idUsuario),
        CONSTRAINT UQ_UsuarioPermiso UNIQUE (idUsuario, idPermiso)
    );
    PRINT 'Tabla UsuarioPermisos creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla UsuarioPermisos ya existe.';
END
GO

-- ===========================================
-- TABLAS DE OPERACIONES (VENTAS, COMPRAS)
-- ===========================================

-- Tabla de tipos de comprobantes mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TiposComprobante')
BEGIN
    CREATE TABLE TiposComprobante (
        Codigo CHAR(2) PRIMARY KEY,
        Nombre VARCHAR(30) NOT NULL,
        Descripcion VARCHAR(100),
        EsElectronico BIT DEFAULT 1,
        AfectaStock BIT DEFAULT 1,
        AfectaCaja BIT DEFAULT 1
    );
    PRINT 'Tabla TiposComprobante creada exitosamente.';
    
    -- Insertar tipos de comprobante solo si no existen
    IF NOT EXISTS (SELECT 1 FROM TiposComprobante WHERE Codigo = '01')
    BEGIN
        INSERT INTO TiposComprobante VALUES 
        ('01','Factura','Factura electrónica',1,1,1),
        ('03','Boleta','Boleta electrónica',1,1,1),
        ('07','Nota de crédito','Nota de crédito electrónica',1,1,1),
        ('08','Nota de débito','Nota de débito electrónica',1,1,1),
        ('RA','Com. Baja','Comunicación de baja',1,0,0),
        ('RC','Resumen','Resumen diario',1,0,0),
        ('10','Guía Rem.','Guía de remitente',0,1,0),
        ('11','Guía Transp.','Guía de transportista',0,1,0),
        ('TK','Ticket','Ticket de despacho',0,1,1),
        ('NP','Nota Pedido','Nota de pedido',0,0,0),
        ('CT','Cotización','Cotización',0,0,0),
        ('NE','Nota Envío','Nota de envío',0,1,0),
        ('RP','Recibo','Recibo de pago',0,0,1);
        PRINT 'Datos iniciales insertados en TiposComprobante.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en TiposComprobante.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla TiposComprobante ya existe.';
END
GO

-- Tabla de series/numeración por empresa y tipo comprobante
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NumeracionComprobantes')
BEGIN
    CREATE TABLE NumeracionComprobantes (
        idNumeracion INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        TipoComprobante CHAR(2) NOT NULL REFERENCES TiposComprobante(Codigo),
        Serie VARCHAR(4) NOT NULL,
        NumeroInicial INT NOT NULL DEFAULT 1,
        NumeroActual INT NOT NULL DEFAULT 1,
        Activo BIT DEFAULT 1,
        CONSTRAINT UQ_SerieEmpresa UNIQUE (idEmpresa, TipoComprobante, Serie)
    );
    PRINT 'Tabla NumeracionComprobantes creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla NumeracionComprobantes ya existe.';
END
GO

-- Crear trigger solo si no existe
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_IncrementaCorrelativo')
BEGIN
    EXEC('
    CREATE TRIGGER trg_IncrementaCorrelativo
    ON Ventas
    AFTER INSERT
    AS
    BEGIN
      UPDATE NumeracionComprobantes
      SET NumeroActual = NumeroActual + 1
      FROM NumeracionComprobantes nc
      JOIN inserted i ON i.idEmpresa = nc.idEmpresa
                      AND i.TipoComprobante = nc.TipoComprobante;
    END;
    ');
    PRINT 'Trigger trg_IncrementaCorrelativo creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'El trigger trg_IncrementaCorrelativo ya existe.';
END
GO

-- Tabla de monedas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Monedas')
BEGIN
    CREATE TABLE Monedas (
        idMoneda INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(3) NOT NULL UNIQUE,  -- Código ISO
        Nombre VARCHAR(50) NOT NULL,
        Simbolo VARCHAR(5) NOT NULL,
        Decimales INT DEFAULT 2
    );
    PRINT 'Tabla Monedas creada exitosamente.';
    
    -- Insertar monedas solo si no existen
    IF NOT EXISTS (SELECT 1 FROM Monedas WHERE Codigo = 'PEN')
    BEGIN
        INSERT INTO Monedas VALUES 
        ('PEN','Nuevo Sol','S/',2),
        ('USD','Dólar Americano','$',2),
        ('EUR','Euro','€',2);
        PRINT 'Datos iniciales insertados en Monedas.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en Monedas.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Monedas ya existe.';
END
GO

-- Tabla de tipos de cambio
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TiposCambio')
BEGIN
    CREATE TABLE TiposCambio (
        idTipoCambio INT IDENTITY PRIMARY KEY,
        Fecha DATE NOT NULL,
        idMoneda INT NOT NULL REFERENCES Monedas(idMoneda),  -- Moneda extranjera
        Compra DECIMAL(10,3) NOT NULL,  -- Tipo de cambio compra
        Venta DECIMAL(10,3) NOT NULL,   -- Tipo de cambio venta
        CONSTRAINT UQ_TipoCambio UNIQUE (Fecha, idMoneda)
    );
    PRINT 'Tabla TiposCambio creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla TiposCambio ya existe.';
END
GO

-- Tabla de condiciones de pago
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CondicionesPago')
BEGIN
    CREATE TABLE CondicionesPago (
        idCondicionPago INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(10) NOT NULL UNIQUE,
        Descripcion VARCHAR(50) NOT NULL,
        DiasCredito INT NOT NULL DEFAULT 0,
        RequiereCuotas BIT DEFAULT 0
    );
    PRINT 'Tabla CondicionesPago creada exitosamente.';
    
    -- Insertar condiciones de pago solo si no existen
    IF NOT EXISTS (SELECT 1 FROM CondicionesPago WHERE Codigo = 'CONTADO')
    BEGIN
        INSERT INTO CondicionesPago VALUES 
        ('CONTADO','Contado',0,0),
        ('CRED07','Crédito 7 días',7,0),
        ('CRED15','Crédito 15 días',15,0),
        ('CRED30','Crédito 30 días',30,0),
        ('CUOTAS','Cuotas',0,1);
        PRINT 'Datos iniciales insertados en CondicionesPago.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en CondicionesPago.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla CondicionesPago ya existe.';
END
GO

-- Tabla de medios de pago
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MediosPago')
BEGIN
    CREATE TABLE MediosPago (
        idMediosPago INT IDENTITY PRIMARY KEY NOT NULL,
        codigo VARCHAR(3) NOT NULL,
        descripcion VARCHAR(50) NOT NULL
    );
    PRINT 'Tabla MediosPago creada exitosamente.';
    
    -- Insertar medios de pago solo si no existen
    IF NOT EXISTS (SELECT 1 FROM MediosPago WHERE codigo = '001')
    BEGIN
        INSERT INTO MediosPago VALUES ('001','DEPOSITO EN CUENTA');
        INSERT INTO MediosPago VALUES ('003','TRANSFERENCIA DE FONDOS');
        INSERT INTO MediosPago VALUES ('005','TARJETA DEBITO');
        INSERT INTO MediosPago VALUES ('006','TARJETA CREDITO');
        INSERT INTO MediosPago VALUES ('009','CONTADO');
        INSERT INTO MediosPago VALUES ('009','CREDITO');
        PRINT 'Datos iniciales insertados en MediosPago.';
    END
    ELSE
    BEGIN
        PRINT 'Los datos iniciales ya existen en MediosPago.';
    END
END
ELSE
BEGIN
    PRINT 'La tabla MediosPago ya existe.';
END
GO

-- Tabla de ventas mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ventas')
BEGIN
    CREATE TABLE Ventas (
        idVenta INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        -- Datos del comprobante:
        TipoComprobante CHAR(2) NOT NULL REFERENCES TiposComprobante(Codigo),
        Serie VARCHAR(4) NOT NULL,
        Numero VARCHAR(8) NOT NULL,
        SerieNumero AS (Serie + '-' + Numero) PERSISTED,
        FechaEmision DATETIME NOT NULL,
        FechaVencimiento DATE,
        -- Datos del cliente:
        idCliente INT NOT NULL REFERENCES Clientes(idCliente),
        -- Datos económicos:
        idMoneda INT NOT NULL REFERENCES Monedas(idMoneda),
        idCondicionPago INT NOT NULL REFERENCES CondicionesPago(idCondicionPago),
        TipoCambio DECIMAL(10,3) NOT NULL,
        -- Totales:
        SubTotal DECIMAL(18,2) NOT NULL,
        DescuentoGlobal DECIMAL(18,2) DEFAULT 0,
        Igv DECIMAL(18,2) NOT NULL,
        Isc DECIMAL(18,2) DEFAULT 0,
        Icbper DECIMAL(18,2) DEFAULT 0,  -- Impuesto a bolsas plásticas
        OtrosCargos DECIMAL(18,2) DEFAULT 0,
        Total DECIMAL(18,2) NOT NULL,
        -- Estado y control:
        Estado VARCHAR(20) NOT NULL,  -- Pendiente, Pagado, Anulado, etc.
        EstadoSunat VARCHAR(50),  -- Aceptado, Rechazado, etc.
        Comentarios VARCHAR(200),
        -- Auditoría:
        idUsuario INT NOT NULL REFERENCES Usuarios(idUsuario),
        FechaCreacion DATETIME DEFAULT GETDATE(),
        FechaModificacion DATETIME,
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_Venta UNIQUE (idEmpresa, TipoComprobante, Serie, Numero)
    );
    PRINT 'Tabla Ventas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Ventas ya existe.';
END
GO

-- Tabla de detalle de ventas mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetalleVentas')
BEGIN
    CREATE TABLE DetalleVentas (
        idDetalleVenta INT IDENTITY PRIMARY KEY,
        idVenta INT NOT NULL REFERENCES Ventas(idVenta),
        Item INT NOT NULL,  -- Número de línea
        idProducto INT NOT NULL REFERENCES Productos(idProducto),
        idLote INT REFERENCES Lotes(idLote),
        Cantidad DECIMAL(10,3) NOT NULL,
        PrecioUnitario DECIMAL(18,5) NOT NULL,
        Descuento DECIMAL(18,2) DEFAULT 0,
        Igv DECIMAL(18,2) NOT NULL,
        Isc DECIMAL(18,2) DEFAULT 0,
        Total DECIMAL(18,2) NOT NULL,
        -- Campos para trazabilidad:
        idEmpresaProducto INT,  -- Para productos de otras empresas en multialmacén
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_DetalleVenta UNIQUE (idVenta, Item)
    );
    PRINT 'Tabla DetalleVentas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla DetalleVentas ya existe.';
END
GO

-- Tabla de compras mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Compras')
BEGIN
    CREATE TABLE Compras (
        idCompra INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        -- Datos del comprobante:
        TipoDocumento CHAR(2) NOT NULL,  -- Factura, Boleta, etc.
        Serie VARCHAR(4) NOT NULL,
        Numero VARCHAR(8) NOT NULL,
        SerieNumero AS (Serie + '-' + Numero) PERSISTED,
        FechaEmision DATE NOT NULL,
        FechaVencimiento DATE,
        -- Datos del proveedor:
        idProveedor INT NOT NULL REFERENCES Proveedores(idProveedor),
        -- Datos económicos:
        idMoneda INT NOT NULL REFERENCES Monedas(idMoneda),
        idCondicionPago INT NOT NULL REFERENCES CondicionesPago(idCondicionPago),
        TipoCambio DECIMAL(10,3) NOT NULL,
        -- Totales:
        SubTotal DECIMAL(18,2) NOT NULL,
        DescuentoGlobal DECIMAL(18,2) DEFAULT 0,
        Igv DECIMAL(18,2) NOT NULL,
        Isc DECIMAL(18,2) DEFAULT 0,
        OtrosCargos DECIMAL(18,2) DEFAULT 0,
        Total DECIMAL(18,2) NOT NULL,
        -- Estado y control:
        Estado VARCHAR(20) NOT NULL,  -- Pendiente, Pagado, Anulado, etc.
        Comentarios VARCHAR(200),
        -- Auditoría:
        idUsuario INT NOT NULL REFERENCES Usuarios(idUsuario),
        FechaCreacion DATETIME DEFAULT GETDATE(),
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_Compra UNIQUE (idEmpresa, TipoDocumento, Serie, Numero)
    );
    PRINT 'Tabla Compras creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Compras ya existe.';
END
GO

-- Tabla de detalle de compras mejorada
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetalleCompras')
BEGIN
    CREATE TABLE DetalleCompras (
        idDetalleCompra INT IDENTITY PRIMARY KEY,
        idCompra INT NOT NULL REFERENCES Compras(idCompra),
        Item INT NOT NULL,  -- Número de línea
        idProducto INT NOT NULL REFERENCES Productos(idProducto),
        Cantidad DECIMAL(10,3) NOT NULL,
        PrecioUnitario DECIMAL(18,5) NOT NULL,
        Descuento DECIMAL(18,2) DEFAULT 0,
        Igv DECIMAL(18,2) NOT NULL,
        Isc DECIMAL(18,2) DEFAULT 0,
        Total DECIMAL(18,2) NOT NULL,
        -- Campos para lotes:
        NumeroLote VARCHAR(50),
        FechaVencimiento DATE,
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_DetalleCompra UNIQUE (idCompra, Item)
    );
    PRINT 'Tabla DetalleCompras creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla DetalleCompras ya existe.';
END
GO

-- ===========================================
-- TABLAS DE FACTURACIÓN ELECTRÓNICA (SUNAT)
-- ===========================================

-- Tabla de facturador SUNAT
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FacturadorSunat')
BEGIN
    CREATE TABLE FacturadorSunat (
        idFacturadorSunat INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        -- Configuración:
        GenerarXML BIT DEFAULT 1,
        EnviarXML BIT DEFAULT 1,
        FirmarDigitalmente BIT DEFAULT 1,
        -- Credenciales:
        UsuarioSol VARCHAR(50),
        ClaveSol VARCHAR(50),
        Endpoint VARCHAR(100),  -- URL del servicio SUNAT
        -- Certificado digital:
        RutaCertificado VARCHAR(200),
        ClaveCertificado VARCHAR(50),
        -- Auditoría:
        FechaConfiguracion DATETIME DEFAULT GETDATE(),
        UltimaConexion DATETIME
    );
    PRINT 'Tabla FacturadorSunat creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla FacturadorSunat ya existe.';
END
GO

-- Tabla de CDR SUNAT
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CdrSunat')
BEGIN
    CREATE TABLE CdrSunat (
        idCdr INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        -- Datos del comprobante:
        TipoComprobante CHAR(2) NOT NULL,
        Serie VARCHAR(4) NOT NULL,
        Numero VARCHAR(8) NOT NULL,
        SerieNumero AS (Serie + '-' + Numero) PERSISTED,
        -- Respuesta SUNAT:
        CodigoRespuesta VARCHAR(10) NOT NULL,
        DescripcionRespuesta VARCHAR(500),
        HashCdr VARCHAR(100),
        HashCpe VARCHAR(100),
        Observaciones VARCHAR(500),
        -- Archivos:
        NombreArchivo VARCHAR(100),
        RutaXml VARCHAR(200),
        RutaCdr VARCHAR(200),
        -- Auditoría:
        FechaRespuesta DATETIME DEFAULT GETDATE(),
        idUsuario INT REFERENCES Usuarios(idUsuario),
        -- Restricción para evitar duplicados:
        CONSTRAINT UQ_Cdr UNIQUE (idEmpresa, TipoComprobante, Serie, Numero)
    );
    PRINT 'Tabla CdrSunat creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla CdrSunat ya existe.';
END
GO

-- ===========================================
-- TABLAS FINANCIERAS (CUENTAS POR COBRAR/PAGAR)
-- ===========================================

-- Tabla de cuentas por cobrar
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CuentasPorCobrar')
BEGIN
    CREATE TABLE CuentasPorCobrar (
        idCuentaPorCobrar INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        idVenta INT NOT NULL REFERENCES Ventas(idVenta),
        -- Datos del documento:
        NumeroLetra VARCHAR(20) NOT NULL,
        FechaEmision DATE NOT NULL,
        FechaVencimiento DATE NOT NULL,
        -- Datos financieros:
        MontoTotal DECIMAL(18,2) NOT NULL,
        SaldoActual DECIMAL(18,2) NOT NULL,
        idMoneda int NOT NULL REFERENCES Monedas(idMoneda),
        TipoCambio DECIMAL(10,3) NOT NULL,
        -- Estado:
        Estado VARCHAR(20) NOT NULL,  -- Pendiente, Pagado, Vencido, etc.
        DiasMora INT DEFAULT 0,
        -- Auditoría:
        FechaCreacion DATETIME DEFAULT GETDATE(),
        idUsuario INT REFERENCES Usuarios(idUsuario),
        -- Restricción:
        CONSTRAINT UQ_CuentaPorCobrar UNIQUE (idEmpresa, idVenta, NumeroLetra)
    );
    PRINT 'Tabla CuentasPorCobrar creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla CuentasPorCobrar ya existe.';
END
GO

-- Tabla de cuentas por pagar
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CuentasPorPagar')
BEGIN
    CREATE TABLE CuentasPorPagar (
        idCuentaPorPagar INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        idCompra INT NOT NULL REFERENCES Compras(idCompra),
        -- Datos del documento:
        NumeroLetra VARCHAR(20) NOT NULL,
        FechaEmision DATE NOT NULL,
        FechaVencimiento DATE NOT NULL,
        -- Datos financieros:
        MontoTotal DECIMAL(18,2) NOT NULL,
        SaldoActual DECIMAL(18,2) NOT NULL,
        idMoneda int NOT NULL REFERENCES Monedas(idMoneda),
        TipoCambio DECIMAL(10,3) NOT NULL,
        -- Estado:
        Estado VARCHAR(20) NOT NULL,  -- Pendiente, Pagado, Vencido, etc.
        DiasMora INT DEFAULT 0,
        -- Auditoría:
        FechaCreacion DATETIME DEFAULT GETDATE(),
        idUsuario INT REFERENCES Usuarios(idUsuario),
        -- Restricción:
        CONSTRAINT UQ_CuentaPorPagar UNIQUE (idEmpresa, idCompra, NumeroLetra)
    );
    PRINT 'Tabla CuentasPorPagar creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla CuentasPorPagar ya existe.';
END
GO

-- ===========================================
-- TABLAS DE CAJA Y BANCOS
-- ===========================================

-- Tabla de cajas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cajas')
BEGIN
    CREATE TABLE Cajas (
        idCaja INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        Codigo VARCHAR(10) UNIQUE NOT NULL,
        Descripcion VARCHAR(50),
        Responsable INT REFERENCES Empleados(idEmpleado),
        Activo BIT DEFAULT 1
    );
    PRINT 'Tabla Cajas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Cajas ya existe.';
END
GO

-- Tabla de aperturas de caja
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AperturaCajas')
BEGIN
    CREATE TABLE AperturaCajas (
        idApertura INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        idCaja INT NOT NULL REFERENCES Cajas(idCaja),
        idUsuario INT NOT NULL REFERENCES Usuarios(idUsuario),
        FechaApertura DATETIME NOT NULL DEFAULT GETDATE(),
        SaldoInicial MONEY NOT NULL,
        SaldoFinal MONEY,
        FechaCierre DATETIME,
        Observacion VARCHAR(255),
        Estado VARCHAR(20) NOT NULL DEFAULT 'Abierta'
    );
    PRINT 'Tabla AperturaCajas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla AperturaCajas ya existe.';
END
GO

-- Tabla de movimientos de caja
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MovimientosCaja')
BEGIN
    CREATE TABLE MovimientosCaja (
        idMovimiento INT IDENTITY PRIMARY KEY,
        idApertura INT NOT NULL REFERENCES AperturaCajas(idApertura),
        Tipo CHAR(1) NOT NULL CHECK (Tipo IN ('I','E')), -- I=Ingreso, E=Egreso
        Fecha DATETIME NOT NULL DEFAULT GETDATE(),
        Concepto VARCHAR(100) NOT NULL,
        Monto MONEY NOT NULL,
        Moneda VARCHAR(3) NOT NULL,
        TipoCambio DECIMAL(10,3) NOT NULL DEFAULT 1,
        Referencia VARCHAR(50), -- N° venta, compra, anulación
        idOrigen INT,           -- idVenta, idCompra, etc.
        TipoOrigen VARCHAR(20), -- 'VENTA', 'COMPRA', 'DEVOLUCION', 'ANULACION'
        Observacion VARCHAR(255),
        idUsuario INT NOT NULL REFERENCES Usuarios(idUsuario)
    );
    PRINT 'Tabla MovimientosCaja creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla MovimientosCaja ya existe.';
END
GO

-- Tabla de bancos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Bancos')
BEGIN
    CREATE TABLE Bancos (
        idBanco INT IDENTITY PRIMARY KEY,
        Codigo VARCHAR(10) NOT NULL UNIQUE,
        Nombre VARCHAR(100) NOT NULL,
        Direccion VARCHAR(200),
        Telefono VARCHAR(15),
        Web VARCHAR(100)
    );
    PRINT 'Tabla Bancos creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Bancos ya existe.';
END
GO

-- Tabla de cuentas bancarias
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CuentasBancarias')
BEGIN
    CREATE TABLE CuentasBancarias (
        idCuentaBancaria INT IDENTITY PRIMARY KEY,
        idEmpresa INT NOT NULL REFERENCES Empresa(idEmpresa),
        idBanco INT NOT NULL REFERENCES Bancos(idBanco),
        -- Datos de la cuenta:
        NumeroCuenta VARCHAR(20) NOT NULL,
        Cci VARCHAR(20),
        Moneda VARCHAR(3) NOT NULL,
        TipoCuenta VARCHAR(20) NOT NULL,  -- Ahorros, Corriente, etc.
        -- Datos adicionales:
        Titular VARCHAR(200) NOT NULL,
        FechaApertura DATE,
        SaldoInicial DECIMAL(18,2) DEFAULT 0,
        -- Estado:
        Activa BIT DEFAULT 1,
        -- Restricción:
        CONSTRAINT UQ_CuentaBancaria UNIQUE (idEmpresa, idBanco, NumeroCuenta)
    );
    PRINT 'Tabla CuentasBancarias creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla CuentasBancarias ya existe.';
END
GO

-- ===========================================
-- TABLAS ADICIONALES PARA FARMACIA
-- ===========================================

-- Tabla de recetas médicas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recetas')
BEGIN
    CREATE TABLE Recetas (
        idReceta INT IDENTITY PRIMARY KEY,
        -- Datos del paciente:
        idCliente INT REFERENCES Clientes(idCliente),
        NombrePaciente VARCHAR(200),
        TipoDocumento CHAR(2) REFERENCES TiposDocumento(Codigo),
        NumeroDocumento VARCHAR(12),
        Edad INT,
        Peso DECIMAL(5,2),
        Altura DECIMAL(5,2),
        -- Datos médicos:
        Diagnostico VARCHAR(500),
        Alergias VARCHAR(500),
        -- Datos del médico:
        NombreMedico VARCHAR(200),
        Cmp VARCHAR(20),
        -- Control:
        FechaEmision DATE NOT NULL,
        FechaVencimiento DATE,
        Estado VARCHAR(20) NOT NULL,  -- Vigente, Vencida, Utilizada
        -- Auditoría:
        FechaRegistro DATETIME DEFAULT GETDATE(),
        idUsuario INT REFERENCES Usuarios(idUsuario)
    );
    PRINT 'Tabla Recetas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Recetas ya existe.';
END
GO

-- Tabla de detalles de receta
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetalleRecetas')
BEGIN
    CREATE TABLE DetalleRecetas (
        idDetalleReceta INT IDENTITY PRIMARY KEY,
        idReceta INT NOT NULL REFERENCES Recetas(idReceta),
        -- Datos del medicamento:
        idProducto INT REFERENCES Productos(idProducto),
        DescripcionManual VARCHAR(200),  -- Para medicamentos no registrados
        -- Posología:
        Dosis VARCHAR(100) NOT NULL,
        Frecuencia VARCHAR(100) NOT NULL,
        Duracion VARCHAR(50) NOT NULL,
        ViaAdministracion VARCHAR(50),
        -- Control:
        Cantidad INT,
        Entregado BIT DEFAULT 0,
        -- Auditoría:
        FechaEntrega DATETIME,
        idUsuarioEntrega INT REFERENCES Usuarios(idUsuario)
    );
    PRINT 'Tabla DetalleRecetas creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla DetalleRecetas ya existe.';
END
GO

-- Tabla de vademécum (información de medicamentos)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vademecum')
BEGIN
    CREATE TABLE Vademecum (
        idVademecum INT IDENTITY PRIMARY KEY,
        -- Identificación:
        NombreComercial VARCHAR(100) NOT NULL,
        PrincipioActivo VARCHAR(100) NOT NULL,
        Concentracion VARCHAR(50) NOT NULL,
        FormaFarmaceutica VARCHAR(50) NOT NULL,
        -- Información técnica:
        Indicaciones TEXT,
        Contraindicaciones TEXT,
        EfectosSecundarios TEXT,
        Precauciones TEXT,
        Interacciones TEXT,
        -- Datos del laboratorio:
        idLaboratorio INT REFERENCES Laboratorios(idLaboratorio),
        RegistroSanitario VARCHAR(50),
        -- Control:
        Activo BIT DEFAULT 1
    );
    PRINT 'Tabla Vademecum creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Vademecum ya existe.';
END
GO

PRINT 'Script de creación de base de datos completado exitosamente.';