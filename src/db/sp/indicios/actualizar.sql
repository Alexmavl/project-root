CREATE OR ALTER PROCEDURE dbo.sp_Indicios_Actualizar
  @id UNIQUEIDENTIFIER,
  @codigo NVARCHAR(40),
  @descripcion NVARCHAR(500),
  @peso DECIMAL(18,3),
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @tecnico_id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @exp UNIQUEIDENTIFIER = (SELECT expediente_id FROM dbo.Indicios WHERE id = @id);
  IF @exp IS NULL RETURN;

  -- Solo el técnico dueño del expediente puede actualizar
  IF NOT EXISTS(SELECT 1 FROM dbo.Expedientes WHERE id = @exp AND tecnico_id = @tecnico_id)
  BEGIN
    RETURN;
  END
  IF EXISTS(SELECT 1 FROM dbo.Indicios WHERE expediente_id = @exp AND codigo = @codigo AND id <> @id)
  BEGIN
    RAISERROR('CODIGO_DUPLICADO', 16, 1);
    RETURN;
  END
  UPDATE dbo.Indicios
  SET codigo = @codigo,
      descripcion = @descripcion,
      peso = @peso,
      color = @color,
      tamano = @tamano,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT TOP 1 * FROM dbo.Indicios WHERE id = @id;
END
