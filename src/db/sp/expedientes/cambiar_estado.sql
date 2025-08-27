CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_CambiarEstado
  @id            UNIQUEIDENTIFIER = NULL,
  @codigo        NVARCHAR(50)     = NULL,
  @estado        NVARCHAR(20),
  @justificacion NVARCHAR(500) = NULL,
  @aprobador_id  UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Resolver id por código (si aplica)
    IF (@id IS NULL AND NULLIF(LTRIM(RTRIM(@codigo)),'') IS NOT NULL)
    BEGIN
      SELECT @id = e.id
      FROM dbo.Expedientes AS e
      WHERE e.codigo = LTRIM(RTRIM(@codigo));
      IF (@id IS NULL)
        THROW 50031, 'EXPEDIENTE_NO_ENCONTRADO', 1;
    END

    IF (@id IS NULL)
      THROW 50032, 'FALTA_ID_O_CODIGO', 1;

    -- Validar existencia
    IF NOT EXISTS (SELECT 1 FROM dbo.Expedientes WHERE id = @id)
      THROW 50011, 'EXPEDIENTE_NO_ENCONTRADO', 1;

    -- Normalizar estado
    SET @estado = LTRIM(RTRIM(LOWER(@estado)));
    IF (@estado NOT IN ('aprobado', 'rechazado'))
      THROW 50010, 'ESTADO_INVALIDO', 1;

    -- Aprobador coordinador activo
    IF NOT EXISTS (
      SELECT 1 FROM dbo.Usuarios
      WHERE id = @aprobador_id AND rol = 'coordinador' AND activo = 1
    )
      THROW 50012, 'APROBADOR_INVALIDO', 1;

    -- Justificación obligatoria si rechazado
    IF (@estado = 'rechazado' AND (NULLIF(LTRIM(RTRIM(@justificacion)), '') IS NULL))
      THROW 50013, 'JUSTIFICACION_REQUERIDA', 1;

    -- (Opcional) Evitar estado idéntico
    -- IF EXISTS (SELECT 1 FROM dbo.Expedientes WHERE id = @id AND estado = @estado)
    --   THROW 50015, 'ESTADO_SIN_CAMBIO', 1;

    -- Actualiza SOLO si está activo
    UPDATE dbo.Expedientes
      SET estado         = @estado,
          aprobador_id   = @aprobador_id,
          fecha_estado   = SYSUTCDATETIME(),
          actualizado_en = SYSUTCDATETIME(),
          justificacion  = @justificacion
    WHERE id = @id
      AND activo = 1;

    IF (@@ROWCOUNT = 0)
      THROW 50014, 'EXPEDIENTE_INACTIVO_O_NO_ENCONTRADO', 1;

    SELECT TOP (1)
           id, codigo, descripcion, estado, tecnico_id, aprobador_id,
           fecha_estado, activo, creado_en, actualizado_en, justificacion
    FROM dbo.Expedientes
    WHERE id = @id;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();
    THROW @num, @msg, @state;
  END CATCH
END
