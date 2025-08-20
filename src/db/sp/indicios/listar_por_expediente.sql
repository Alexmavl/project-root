CREATE OR ALTER PROCEDURE dbo.sp_Indicios_ListarPorExpediente
  @expediente_id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.Indicios WHERE expediente_id = @expediente_id ORDER BY creado_en DESC;
END
