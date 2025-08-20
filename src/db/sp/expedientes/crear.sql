CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Crear
  @codigo NVARCHAR(40),
  @descripcion NVARCHAR(500),
  @tecnico_id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS(SELECT 1 FROM dbo.Expedientes WHERE codigo = @codigo)
  BEGIN
    RAISERROR('CODIGO_DUPLICADO', 16, 1);
    RETURN;
  END
  INSERT INTO dbo.Expedientes (codigo, descripcion, tecnico_id, estado, activo)
  VALUES (@codigo, @descripcion, @tecnico_id, 'pendiente', 1);
  SELECT TOP 1 * FROM dbo.Expedientes WHERE codigo = @codigo;
END
