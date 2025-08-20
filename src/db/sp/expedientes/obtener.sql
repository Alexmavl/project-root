CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Obtener
  @id UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Expedientes WHERE id = @id)
    THROW 50031, 'EXPEDIENTE_NO_ENCONTRADO', 1;

  SELECT TOP (1)
         id, codigo, descripcion, estado,
         tecnico_id, aprobador_id, fecha_estado,
         activo, creado_en, actualizado_en
  FROM dbo.Expedientes
  WHERE id = @id;
END
GO
