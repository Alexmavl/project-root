CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_CambiarEstado
  @id UNIQUEIDENTIFIER,
  @estado NVARCHAR(20),          -- 'aprobado' | 'rechazado'
  @justificacion NVARCHAR(500) = NULL,
  @aprobador_id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Expedientes
  SET estado = @estado,
      aprobador_id = @aprobador_id,
      fecha_estado = SYSUTCDATETIME(),
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT TOP 1 * FROM dbo.Expedientes WHERE id = @id;
END
