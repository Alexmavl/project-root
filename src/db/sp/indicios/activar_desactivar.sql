CREATE OR ALTER PROCEDURE dbo.sp_Indicios_ActivarDesactivar
  @id UNIQUEIDENTIFIER,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Indicios SET activo = @activo, actualizado_en = SYSUTCDATETIME() WHERE id = @id;
  SELECT TOP 1 * FROM dbo.Indicios WHERE id = @id;
END
