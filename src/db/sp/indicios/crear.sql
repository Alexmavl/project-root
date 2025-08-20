CREATE OR ALTER PROCEDURE dbo.sp_Indicios_Crear
  @expediente_id UNIQUEIDENTIFIER,
  @codigo NVARCHAR(40),
  @descripcion NVARCHAR(500),
  @peso DECIMAL(18,3),
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @tecnico_id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  -- Solo el técnico dueño del expediente puede crear indicios
  IF NOT EXISTS(SELECT 1 FROM dbo.Expedientes WHERE id = @expediente_id AND tecnico_id = @tecnico_id)
  BEGIN
    RETURN; -- sin permisos
  END
  IF EXISTS(SELECT 1 FROM dbo.Indicios WHERE expediente_id = @expediente_id AND codigo = @codigo)
  BEGIN
    RAISERROR('CODIGO_DUPLICADO', 16, 1);
    RETURN;
  END
  INSERT INTO dbo.Indicios (expediente_id, codigo, descripcion, peso, color, tamano, activo)
  VALUES (@expediente_id, @codigo, @descripcion, @peso, @color, @tamano, 1);

  SELECT TOP 1 * FROM dbo.Indicios WHERE expediente_id = @expediente_id AND codigo = @codigo;
END
