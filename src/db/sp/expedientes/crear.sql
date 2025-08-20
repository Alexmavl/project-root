CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Crear
  @codigo       NVARCHAR(40),
  @descripcion  NVARCHAR(500),
  @tecnico_id   UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Normalizar
    SET @codigo      = LTRIM(RTRIM(@codigo));
    SET @descripcion = LTRIM(RTRIM(@descripcion));

    -- Validaciones rápidas
    IF (@codigo = N'') THROW 50020, 'CODIGO_REQUERIDO', 1;
    IF (@descripcion = N'') THROW 50021, 'DESCRIPCION_REQUERIDA', 1;

    -- Unicidad (pre-check)
    IF EXISTS (SELECT 1 FROM dbo.Expedientes WHERE codigo = @codigo)
      THROW 50022, 'CODIGO_DUPLICADO', 1;

    INSERT INTO dbo.Expedientes (codigo, descripcion, tecnico_id, estado, activo)
    VALUES (@codigo, @descripcion, @tecnico_id, 'pendiente', 1);

    SELECT TOP (1)
           id, codigo, descripcion, estado, tecnico_id, aprobador_id,
           fecha_estado, activo, creado_en, actualizado_en
    FROM dbo.Expedientes
    WHERE codigo = @codigo;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();

    -- Colisión de índice único (por carrera): 2627/2601
    IF @num IN (2601, 2627) THROW 50022, 'CODIGO_DUPLICADO', 1;

    THROW @num, @msg, @state;
  END CATCH
END
GO
