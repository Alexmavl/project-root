CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_ActivarDesactivar
  @id UNIQUEIDENTIFIER,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Expedientes SET activo = @activo, actualizado_en = SYSUTCDATETIME() WHERE id = @id;
  SELECT TOP 1 * FROM dbo.Expedientes WHERE id = @id;
END
