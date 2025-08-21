CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_ActivarDesactivar
  @id      UNIQUEIDENTIFIER = NULL,
  @codigo  NVARCHAR(50)     = NULL,
  @activo  BIT
AS
BEGIN
  SET NOCOUNT ON;

  -- Resolver id si no viene y sí viene código
  IF (@id IS NULL AND NULLIF(LTRIM(RTRIM(@codigo)), '') IS NOT NULL)
  BEGIN
    SELECT @id = e.id
    FROM dbo.Expedientes e
    WHERE e.codigo = LTRIM(RTRIM(@codigo));
  END

  IF (@id IS NULL)
    THROW 51001, 'FALTA_ID_O_CODIGO', 1;

  IF NOT EXISTS(SELECT 1 FROM dbo.Expedientes WHERE id = @id)
    THROW 51000, 'EXPEDIENTE_NO_ENCONTRADO', 1;

  UPDATE dbo.Expedientes
    SET activo = @activo,
        actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT id, activo, actualizado_en
  FROM dbo.Expedientes
  WHERE id = @id;
END