-- Tablas base (SQL Server)
CREATE TABLE dbo.Usuarios (
  id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  nombre NVARCHAR(120) NOT NULL,
  email NVARCHAR(160) NOT NULL UNIQUE,
  rol NVARCHAR(20) NOT NULL CHECK (rol IN ('tecnico','coordinador')),
  password_hash NVARCHAR(200) NOT NULL,
  activo BIT NOT NULL DEFAULT 1,
  creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  actualizado_en DATETIME2 NULL
);

CREATE TABLE dbo.Expedientes (
  id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  codigo NVARCHAR(40) NOT NULL UNIQUE,
  descripcion NVARCHAR(500) NOT NULL,
  estado NVARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
  tecnico_id UNIQUEIDENTIFIER NOT NULL,
  aprobador_id UNIQUEIDENTIFIER NULL,
  fecha_estado DATETIME2 NULL,
  activo BIT NOT NULL DEFAULT 1,
  creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  actualizado_en DATETIME2 NULL,
  CONSTRAINT FK_Exp_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dbo.Usuarios(id),
  CONSTRAINT FK_Exp_Aprobador FOREIGN KEY (aprobador_id) REFERENCES dbo.Usuarios(id)
);

CREATE TABLE dbo.Indicios (
  id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  expediente_id UNIQUEIDENTIFIER NOT NULL,
  codigo NVARCHAR(40) NOT NULL,
  descripcion NVARCHAR(500) NOT NULL,
  peso DECIMAL(18,3) NOT NULL CHECK (peso >= 0),
  color NVARCHAR(50) NULL,
  tamano NVARCHAR(50) NULL,
  activo BIT NOT NULL DEFAULT 1,
  creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  actualizado_en DATETIME2 NULL,
  CONSTRAINT FK_Ind_Exp FOREIGN KEY (expediente_id) REFERENCES dbo.Expedientes(id),
  CONSTRAINT UQ_Ind_CodigoPerExp UNIQUE (expediente_id, codigo)
);
