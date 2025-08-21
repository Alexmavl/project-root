CREATE OR ALTER PROCEDURE dbo.sp_Indicios_ActivarDesactivar
  @id                UNIQUEIDENTIFIER = NULL,   -- Opción 1: por id del indicio
  @expediente_id     UNIQUEIDENTIFIER = NULL,   -- Opción 2a: por expediente + codigo_lookup
  @expediente_codigo NVARCHAR(50)     = NULL,   -- Opción 2b: por código del expediente
  @codigo_lookup     NVARCHAR(40)     = NULL,   -- código del indicio a buscar
  @activo            BIT,
  @tecnico_id        UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Normalizar
    SET @expediente_codigo = NULLIF(LTRIM(RTRIM(@expediente_codigo)), '');
    SET @codigo_lookup     = NULLIF(LTRIM(RTRIM(@codigo_lookup)), '');

    -- Resolver expediente_id si vino por código
    IF (@expediente_id IS NULL AND @expediente_codigo IS NOT NULL)
    BEGIN
      SELECT @expediente_id = e.id
      FROM dbo.Expedientes e
      WHERE e.codigo = @expediente_codigo;
      IF (@expediente_id IS NULL)
        THROW 50031, 'EXPEDIENTE_NO_ENCONTRADO', 1;
    END

    -- Resolver id si no vino directo
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

    -- Obtener expediente asociado
    DECLARE @exp UNIQUEIDENTIFIER;
    SELECT @exp = i.expediente_id
    FROM dbo.Indicios i
    WHERE i.id = @id;

    IF (@exp IS NULL)
      THROW 50041, 'INDICIO_NO_ENCONTRADO', 1;

    -- Validar ownership (solo técnico dueño del expediente puede activar/desactivar)
    IF NOT EXISTS (
      SELECT 1
      FROM dbo.Expedientes e
      WHERE e.id = @exp AND e.tecnico_id = @tecnico_id
    )
      THROW 50033, 'NO_AUTORIZADO_O_NO_ENCONTRADO', 1;

    -- Actualizar
    UPDATE dbo.Indicios
      SET activo = @activo,
          actualizado_en = SYSUTCDATETIME()
    WHERE id = @id;

    -- Salida
    SELECT TOP (1)
           i.id, i.expediente_id, i.codigo, i.descripcion,
           i.peso, i.color, i.tamano,
           i.activo, i.creado_en, i.actualizado_en
    FROM dbo.Indicios i
    WHERE i.id = @id;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();
    THROW @num, @msg, @state;
  END CATCH
END
GO
