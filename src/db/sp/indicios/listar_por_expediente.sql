CREATE OR ALTER PROCEDURE dbo.sp_Indicios_ListarPorExpediente
  @expediente_id     UNIQUEIDENTIFIER = NULL,       -- id del expediente
  @expediente_codigo NVARCHAR(50)     = NULL,       -- o código del expediente
  @q                 NVARCHAR(100)    = NULL,       -- búsqueda en codigo/descripcion
  @page              INT              = 1,
  @pageSize          INT              = 10,
  @activo            BIT              = NULL        -- filtrar por activo
AS
BEGIN
  SET NOCOUNT ON;

  -- Normalizar
  SET @q                 = NULLIF(LTRIM(RTRIM(@q)), '');
  SET @expediente_codigo = NULLIF(LTRIM(RTRIM(@expediente_codigo)), '');

  IF (@page IS NULL OR @page < 1) SET @page = 1;
  IF (@pageSize IS NULL OR @pageSize < 1) SET @pageSize = 10;
  IF (@pageSize > 200) SET @pageSize = 200;

  -- Resolver expediente_id si se pasa código
  IF (@expediente_id IS NULL AND @expediente_codigo IS NOT NULL)
  BEGIN
    SELECT @expediente_id = e.id
    FROM dbo.Expedientes e
    WHERE e.codigo = @expediente_codigo;

    IF (@expediente_id IS NULL)
    BEGIN
      -- devolver estructura vacía
      SELECT TOP (0)
        i.id, i.expediente_id, i.codigo, i.descripcion,
        i.peso, i.color, i.tamano,
        i.activo,
        i.creado_en, i.actualizado_en,
        total = CAST(0 AS INT)
      FROM dbo.Indicios i
      WHERE 1 = 0;
      RETURN;
    END
  END

  ;WITH F AS (
    SELECT
      i.id, i.expediente_id, i.codigo, i.descripcion,
      i.peso, i.color, i.tamano,
      i.activo,
      i.creado_en, i.actualizado_en,
      total = COUNT(*) OVER()
    FROM dbo.Indicios i
    WHERE
      (@expediente_id IS NULL OR i.expediente_id = @expediente_id)
      AND (@q IS NULL OR i.codigo LIKE '%'+@q+'%' OR i.descripcion LIKE '%'+@q+'%')
      AND (@activo IS NULL OR i.activo = @activo)
  )
  SELECT *
  FROM F
  ORDER BY creado_en DESC
  OFFSET (@page - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END
GO
