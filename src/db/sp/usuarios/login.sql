CREATE OR ALTER PROCEDURE dbo.sp_Usuarios_Login
  @email NVARCHAR(160)
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  SELECT TOP 1 id, nombre, email, rol, password_hash, activo
  FROM dbo.Usuarios
  WHERE email = @email AND activo = 1;
END
GO
