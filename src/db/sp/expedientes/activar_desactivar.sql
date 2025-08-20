CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_ActivarDesactivar
  @id UNIQUEIDENTIFIER,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;

  -- Verificamos si existe el expediente
  IF NOT EXISTS(SELECT 1 FROM dbo.Expedientes WHERE id = @id)
  BEGIN
    THROW 51000, 'EXPEDIENTE_NO_ENCONTRADO', 1;
    RETURN;
  END

  -- Actualizamos el estado
  UPDATE dbo.Expedientes
    SET activo = @activo,
        actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  -- Devolvemos solo las columnas necesarias
  SELECT id, activo, actualizado_en
  FROM dbo.Expedientes
  WHERE id = @id;
END
