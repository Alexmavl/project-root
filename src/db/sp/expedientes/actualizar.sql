CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Actualizar
  @id UNIQUEIDENTIFIER,
  @codigo NVARCHAR(40),
  @descripcion NVARCHAR(500),
  @tecnico_id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  -- Solo el técnico dueño puede actualizar
  IF NOT EXISTS(SELECT 1 FROM dbo.Expedientes WHERE id = @id AND tecnico_id = @tecnico_id)
  BEGIN
    RETURN; -- devuelve 0 filas => API responde 404/permisos
  END
  IF EXISTS(SELECT 1 FROM dbo.Expedientes WHERE codigo = @codigo AND id <> @id)
  BEGIN
    RAISERROR('CODIGO_DUPLICADO', 16, 1);
    RETURN;
  END
  UPDATE dbo.Expedientes
  SET codigo = @codigo,
      descripcion = @descripcion,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT TOP 1 * FROM dbo.Expedientes WHERE id = @id;
END
