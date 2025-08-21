CREATE OR ALTER PROCEDURE dbo.sp_Indicios_Actualizar
  @id                UNIQUEIDENTIFIER = NULL,   -- opción 1: actualizar por id del indicio
  @expediente_id     UNIQUEIDENTIFIER = NULL,   -- opción 2a: identificar por expediente + codigo_lookup
  @expediente_codigo NVARCHAR(50)     = NULL,   -- opción 2b: identificar por código del expediente
  @codigo_lookup     NVARCHAR(40)     = NULL,   -- código ACTUAL del indicio (para buscarlo)
  -- === Nuevos valores a guardar ===
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
    -- Normalizar entradas
    SET @expediente_codigo = NULLIF(LTRIM(RTRIM(@expediente_codigo)), '');
    SET @codigo_lookup     = NULLIF(LTRIM(RTRIM(@codigo_lookup)), '');
    SET @codigo            = NULLIF(LTRIM(RTRIM(@codigo)), '');
    SET @descripcion       = NULLIF(LTRIM(RTRIM(@descripcion)), '');
    SET @color             = NULLIF(LTRIM(RTRIM(@color)), '');
    SET @tamano            = NULLIF(LTRIM(RTRIM(@tamano)), '');

    -- Resolver expediente_id si vino @expediente_codigo
    IF (@expediente_id IS NULL AND @expediente_codigo IS NOT NULL)
    BEGIN
      SELECT @expediente_id = e.id
      FROM dbo.Expedientes e
      WHERE e.codigo = @expediente_codigo;
      IF (@expediente_id IS NULL)
        THROW 50031, 'EXPEDIENTE_NO_ENCONTRADO', 1;
    END

    -- Si no vino @id, intentar localizar el indicio por (@expediente_id + @codigo_lookup)
    IF (@id IS NULL)
    BEGIN
      IF (@expediente_id IS NULL OR @codigo_lookup IS NULL)
        THROW 50032, 'FALTA_ID_O_CODIGO', 1;

      SELECT @id = i.id
      FROM dbo.Indicios i
      WHERE i.expediente_id = @expediente_id
        AND i.codigo = @codigo_lookup;

      IF (@id IS NULL)
        THROW 50041, 'INDICIO_NO_ENCONTRADO', 1;
    END

    -- Obtener el expediente del indicio (para validar ownership)
    DECLARE @exp UNIQUEIDENTIFIER;
    SELECT @exp = i.expediente_id
    FROM dbo.Indicios i
    WHERE i.id = @id;

    IF (@exp IS NULL)
      THROW 50041, 'INDICIO_NO_ENCONTRADO', 1;

    -- Validar ownership: solo el técnico dueño del expediente puede actualizar
    IF NOT EXISTS (
      SELECT 1
      FROM dbo.Expedientes e
      WHERE e.id = @exp AND e.tecnico_id = @tecnico_id
    )
      THROW 50033, 'NO_AUTORIZADO_O_NO_ENCONTRADO', 1;

    -- Validaciones de negocio
    IF (@codigo IS NULL)      THROW 50001, 'CODIGO_REQUERIDO', 1;
    IF (@descripcion IS NULL) THROW 50002, 'DESCRIPCION_REQUERIDA', 1;
    IF (@peso IS NULL OR @peso < 0) THROW 50034, 'PESO_INVALIDO', 1;

    -- Unicidad: (expediente_id, codigo) debe ser único
    IF EXISTS (
      SELECT 1
      FROM dbo.Indicios x
      WHERE x.expediente_id = @exp
        AND x.codigo = @codigo
        AND x.id <> @id
    )
      THROW 50003, 'CODIGO_DUPLICADO', 1;

    -- Actualizar
    UPDATE dbo.Indicios
      SET codigo         = @codigo,
          descripcion    = @descripcion,
          peso           = @peso,
          color          = @color,
          tamano         = @tamano,
          actualizado_en = SYSUTCDATETIME()
    WHERE id = @id;

    -- Salida estable
    SELECT TOP (1)
           i.id, i.expediente_id, i.codigo, i.descripcion,
           i.peso, i.color, i.tamano,
           i.activo, i.creado_en, i.actualizado_en
    FROM dbo.Indicios i
    WHERE i.id = @id;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();

    -- Mapear violación de unicidad (índice UQ_Ind_CodigoPerExp) si aplica
    IF @num IN (2601, 2627)
      THROW 50003, 'CODIGO_DUPLICADO', 1;

    THROW @num, @msg, @state;
  END CATCH
END
GO
