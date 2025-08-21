CREATE OR ALTER PROCEDURE dbo.sp_Indicios_Crear
  @expediente_id     UNIQUEIDENTIFIER = NULL,   -- opcional
  @expediente_codigo NVARCHAR(50)     = NULL,   -- opcional (resolvemos id desde aquí)
  @codigo            NVARCHAR(40),
  @descripcion       NVARCHAR(500),
  @peso              DECIMAL(18,3),
  @color             NVARCHAR(50) = NULL,
  @tamano            NVARCHAR(50) = NULL,
  @tecnico_id        UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- 1) Resolver @expediente_id si vino @expediente_codigo
    IF (@expediente_id IS NULL AND NULLIF(LTRIM(RTRIM(@expediente_codigo)), '') IS NOT NULL)
    BEGIN
      SELECT @expediente_id = e.id
      FROM dbo.Expedientes e
      WHERE e.codigo = LTRIM(RTRIM(@expediente_codigo));

      IF (@expediente_id IS NULL)
        THROW 50031, 'EXPEDIENTE_NO_ENCONTRADO', 1;
    END

    -- 2) Validaciones básicas
    IF (@expediente_id IS NULL)
      THROW 50032, 'FALTA_ID_O_CODIGO', 1;

    -- Solo el técnico dueño del expediente puede crear indicios
    IF NOT EXISTS (
      SELECT 1 FROM dbo.Expedientes
      WHERE id = @expediente_id AND tecnico_id = @tecnico_id
    )
      THROW 50033, 'NO_AUTORIZADO_O_NO_ENCONTRADO', 1;

    -- Normalizar entradas
    SET @codigo      = NULLIF(LTRIM(RTRIM(@codigo)), '');
    SET @descripcion = NULLIF(LTRIM(RTRIM(@descripcion)), '');
    SET @color       = NULLIF(LTRIM(RTRIM(@color)), '');
    SET @tamano      = NULLIF(LTRIM(RTRIM(@tamano)), '');

    IF (@codigo IS NULL)      THROW 50001, 'CODIGO_REQUERIDO', 1;
    IF (@descripcion IS NULL) THROW 50002, 'DESCRIPCION_REQUERIDA', 1;
    IF (@peso IS NULL OR @peso < 0) THROW 50034, 'PESO_INVALIDO', 1;

    -- Duplicado por expediente
    IF EXISTS (
      SELECT 1
      FROM dbo.Indicios
      WHERE expediente_id = @expediente_id AND codigo = @codigo
    )
      THROW 50003, 'CODIGO_DUPLICADO', 1;

    -- 3) Insert
    INSERT INTO dbo.Indicios (expediente_id, codigo, descripcion, peso, color, tamano, activo)
    VALUES (@expediente_id, @codigo, @descripcion, @peso, @color, @tamano, 1);

    -- 4) Salida: devuelve el registro recién creado
    SELECT TOP (1) *
    FROM dbo.Indicios
    WHERE expediente_id = @expediente_id AND codigo = @codigo;
  END TRY
  BEGIN CATCH
    DECLARE
      @num  INT = ERROR_NUMBER(),
      @msg  NVARCHAR(2048) = ERROR_MESSAGE(),
      @stat INT = ERROR_STATE();

    -- Mapear violación de unicidad por si tienes índice único
    IF @num IN (2601, 2627)
      THROW 50003, 'CODIGO_DUPLICADO', 1;

    THROW @num, @msg, @stat;
  END CATCH
END
GO
