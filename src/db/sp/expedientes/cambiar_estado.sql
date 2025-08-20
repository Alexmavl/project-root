CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_CambiarEstado
  @id            UNIQUEIDENTIFIER,
  @estado        NVARCHAR(20),           -- 'aprobado' | 'rechazado'
  @justificacion NVARCHAR(500) = NULL,
  @aprobador_id  UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Normaliza y valida estado
    SET @estado = LTRIM(RTRIM(LOWER(@estado)));
    IF (@estado NOT IN ('aprobado', 'rechazado'))
      THROW 50010, 'ESTADO_INVALIDO', 1;

    -- Debe existir el expediente
    IF NOT EXISTS (SELECT 1 FROM dbo.Expedientes WHERE id = @id)
      THROW 50011, 'EXPEDIENTE_NO_ENCONTRADO', 1;

    -- Aprobador debe existir, estar activo y ser coordinador
    IF NOT EXISTS (
      SELECT 1 FROM dbo.Usuarios
      WHERE id = @aprobador_id AND rol = 'coordinador' AND activo = 1
    )
      THROW 50012, 'APROBADOR_INVALIDO', 1;

    -- (Regla opcional) exigir justificación si se rechaza
    IF (@estado = 'rechazado' AND (NULLIF(LTRIM(RTRIM(@justificacion)), '') IS NULL))
      THROW 50013, 'JUSTIFICACION_REQUERIDA', 1;

    -- Actualiza estado (y justificación si tienes la columna)
    UPDATE dbo.Expedientes
      SET estado         = @estado,
          aprobador_id   = @aprobador_id,
          fecha_estado   = SYSUTCDATETIME(),
          actualizado_en = SYSUTCDATETIME(),
          justificacion  = @justificacion   -- comenta esta línea si no agregaste la columna
    WHERE id = @id;

    -- Contrato de salida (evita SELECT *)
    SELECT TOP (1)
           id, codigo, descripcion, estado, tecnico_id, aprobador_id,
           fecha_estado, activo, creado_en, actualizado_en,
           justificacion   -- comenta si no agregaste la columna
    FROM dbo.Expedientes
    WHERE id = @id;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();
    THROW @num, @msg, @state;
  END CATCH
END
GO
