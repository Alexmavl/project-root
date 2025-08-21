USE gestiondb;

  CREATE TABLE dbo.Usuarios (
    id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    nombre NVARCHAR(120) NOT NULL,
    email NVARCHAR(160) NOT NULL UNIQUE,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('tecnico','coordinador')),
    password_hash NVARCHAR(200) NOT NULL,
    activo BIT NOT NULL DEFAULT 1,
    creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );



  CREATE TABLE dbo.Expedientes (
    id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    codigo NVARCHAR(40) NOT NULL UNIQUE,
    descripcion NVARCHAR(500) NOT NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
    tecnico_id UNIQUEIDENTIFIER NOT NULL,
    aprobador_id UNIQUEIDENTIFIER NULL,
    fecha_estado DATETIME2 NULL,
    activo BIT NOT NULL DEFAULT 1,
    creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Exp_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dbo.Usuarios(id)
  );



  CREATE TABLE dbo.Indicios (
    id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    expediente_id UNIQUEIDENTIFIER NOT NULL,
    codigo NVARCHAR(40) NOT NULL,
    descripcion NVARCHAR(500) NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    activo BIT NOT NULL DEFAULT 1,
    creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Indicio UNIQUE (expediente_id, codigo),
    CONSTRAINT FK_Ind_Exp FOREIGN KEY (expediente_id) REFERENCES dbo.Expedientes(id)
  );

