CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Actualizar
  @id          UNIQUEIDENTIFIER,
  @codigo      NVARCHAR(40),
  @descripcion NVARCHAR(500),
  @tecnico_id  UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- 1) Validar ownership (existe y pertenece al técnico)
    IF NOT EXISTS (
      SELECT 1
      FROM dbo.Expedientes
      WHERE id = @id AND tecnico_id = @tecnico_id
    )
      THROW 50005, 'NO_AUTORIZADO_O_NO_ENCONTRADO', 1;

    -- 2) Normalizar entradas
    SET @codigo      = LTRIM(RTRIM(@codigo));
    SET @descripcion = LTRIM(RTRIM(@descripcion));

    -- 3) Validar duplicado de código (otro id con mismo código)
    IF EXISTS (
      SELECT 1
      FROM dbo.Expedientes
      WHERE codigo = @codigo AND id <> @id
    )
      THROW 50006, 'CODIGO_DUPLICADO', 1;

    -- 4) Actualizar
    UPDATE dbo.Expedientes
      SET codigo        = @codigo,
          descripcion   = @descripcion,
          actualizado_en = SYSUTCDATETIME()
    WHERE id = @id AND tecnico_id = @tecnico_id;

    -- 5) Seleccionar resultado (contrato estable para la API)
    SELECT TOP (1)
           id, codigo, descripcion, estado, tecnico_id, aprobador_id,
           fecha_estado, activo, creado_en, actualizado_en
    FROM dbo.Expedientes
    WHERE id = @id;

  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();

    -- Mapear violaciones de unicidad del índice/constraint (carrera)
    IF @num IN (2601, 2627)
      THROW 50006, 'CODIGO_DUPLICADO', 1;

    -- Re-lanzar el error original (o podrías normalizarlo)
    THROW @num, @msg, @state;
  END CATCH
END
GO
