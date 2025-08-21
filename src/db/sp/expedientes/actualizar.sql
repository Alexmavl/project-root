CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Actualizar
  @id             UNIQUEIDENTIFIER = NULL,
  @codigo_lookup  NVARCHAR(50)     = NULL, -- para resolver id por código si no mandan @id
  @codigo         NVARCHAR(40),
  @descripcion    NVARCHAR(500),
  @tecnico_id     UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Resolver @id si no vino y sí vino @codigo_lookup
    IF (@id IS NULL AND NULLIF(LTRIM(RTRIM(@codigo_lookup)), '') IS NOT NULL)
    BEGIN
      SELECT @id = e.id
      FROM dbo.Expedientes e
      WHERE e.codigo = LTRIM(RTRIM(@codigo_lookup));
      IF (@id IS NULL)
        THROW 50031, 'EXPEDIENTE_NO_ENCONTRADO', 1;
    END

    IF (@id IS NULL)
      THROW 50032, 'FALTA_ID_O_CODIGO', 1;

    -- Validar ownership
    IF NOT EXISTS (
      SELECT 1 FROM dbo.Expedientes WHERE id = @id AND tecnico_id = @tecnico_id
    )
      THROW 50005, 'NO_AUTORIZADO_O_NO_ENCONTRADO', 1;

    -- Normalizar
    SET @codigo      = NULLIF(LTRIM(RTRIM(@codigo)), '');
    SET @descripcion = NULLIF(LTRIM(RTRIM(@descripcion)), '');

    IF (@codigo IS NULL)      THROW 50001, 'CODIGO_REQUERIDO', 1;
    IF (@descripcion IS NULL) THROW 50002, 'DESCRIPCION_REQUERIDA', 1;

    -- Duplicado de código (otro id con mismo código)
    IF EXISTS (SELECT 1 FROM dbo.Expedientes WHERE codigo = @codigo AND id <> @id)
      THROW 50006, 'CODIGO_DUPLICADO', 1;

    UPDATE dbo.Expedientes
      SET codigo        = @codigo,
          descripcion   = @descripcion,
          actualizado_en = SYSUTCDATETIME()
    WHERE id = @id AND tecnico_id = @tecnico_id;

    SELECT TOP (1)
           id, codigo, descripcion, estado, tecnico_id, aprobador_id,
           fecha_estado, activo, creado_en, actualizado_en
    FROM dbo.Expedientes
    WHERE id = @id;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();
    IF @num IN (2601, 2627) THROW 50006, 'CODIGO_DUPLICADO', 1;
    THROW @num, @msg, @state;
  END CATCH
END
GO