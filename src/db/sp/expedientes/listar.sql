CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Listar
  @q NVARCHAR(100) = NULL,
  @page INT = 1,
  @pageSize INT = 10,
  @estado NVARCHAR(20) = NULL,
  @activo BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  WITH base AS (
    SELECT *
    FROM dbo.Expedientes e
    WHERE (@estado IS NULL OR e.estado = @estado)
      AND (@activo IS NULL OR e.activo = @activo)
      AND (@q IS NULL OR e.codigo LIKE '%' + @q + '%' OR e.descripcion LIKE '%' + @q + '%')
  )
  SELECT *
  FROM base
  ORDER BY creado_en DESC
  OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
