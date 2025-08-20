CREATE OR ALTER PROCEDURE dbo.sp_Expedientes_Listar
  @q        NVARCHAR(100) = NULL,
  @page     INT          = 1,
  @pageSize INT          = 10,
  @estado   NVARCHAR(20) = NULL,   -- 'pendiente' | 'aprobado' | 'rechazado' (opcional)
  @activo   BIT          = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Normaliza y sanea entradas
    SET @q      = NULLIF(LTRIM(RTRIM(@q)), N'');
    SET @estado = NULLIF(LTRIM(RTRIM(@estado)), N'');

    -- Valida página y tamaño (y limita tamaño máx.)
    SET @page     = CASE WHEN @page < 1 THEN 1 ELSE @page END;
    SET @pageSize = CASE 
                      WHEN @pageSize < 1 THEN 10
                      WHEN @pageSize > 200 THEN 200
                      ELSE @pageSize
                    END;

    -- (Opcional) valida estado permitido
    IF (@estado IS NOT NULL AND @estado NOT IN (N'pendiente', N'aprobado', N'rechazado'))
      THROW 50030, 'ESTADO_INVALIDO', 1;

    ;WITH base AS (
      SELECT
        e.id, e.codigo, e.descripcion, e.estado,
        e.tecnico_id, e.aprobador_id, e.fecha_estado,
        e.activo, e.creado_en, e.actualizado_en
      FROM dbo.Expedientes e
      WHERE (@estado IS NULL OR e.estado = @estado)
        AND (@activo IS NULL OR e.activo = @activo)
        AND (
          @q IS NULL OR
          e.codigo      LIKE N'%' + @q + N'%' OR
          e.descripcion LIKE N'%' + @q + N'%'
        )
    ),
    paged AS (
      SELECT
        *,
        COUNT(*) OVER() AS total
      FROM base
    )
    SELECT  -- devuelve solo la página pedida + total
      id, codigo, descripcion, estado,
      tecnico_id, aprobador_id, fecha_estado,
      activo, creado_en, actualizado_en,
      total
    FROM paged
    ORDER BY creado_en DESC, id
    OFFSET (@page - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
  END TRY
  BEGIN CATCH
    DECLARE @num INT = ERROR_NUMBER(), @msg NVARCHAR(2048) = ERROR_MESSAGE(), @state INT = ERROR_STATE();
    THROW @num, @msg, @state;
  END CATCH
END
GO
