CREATE OR ALTER PROCEDURE dbo.sp_Usuarios_Listar
  @q NVARCHAR(100)=NULL,
  @page INT=1,
  @pageSize INT=10,
  @activo BIT=NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET @q = NULLIF(LTRIM(RTRIM(@q)), N'');
  SET @page     = CASE WHEN @page < 1 THEN 1 ELSE @page END;
  SET @pageSize = CASE WHEN @pageSize < 1 THEN 10 WHEN @pageSize > 200 THEN 200 ELSE @pageSize END;

  ;WITH base AS (
    SELECT id,nombre,email,rol,activo,creado_en,actualizado_en
    FROM dbo.Usuarios
    WHERE (@activo IS NULL OR activo=@activo)
      AND (@q IS NULL OR nombre LIKE N'%'+@q+N'%' OR email LIKE N'%'+@q+N'%')
  ), paged AS (
    SELECT *, COUNT(*) OVER() AS total FROM base
  )
  SELECT id,nombre,email,rol,activo,creado_en,actualizado_en,total
  FROM paged
  ORDER BY nombre, id
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
