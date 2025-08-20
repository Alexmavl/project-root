CREATE OR ALTER PROCEDURE dbo.sp_Usuarios_Crear
  @nombre NVARCHAR(120),
  @email NVARCHAR(160),
  @rol NVARCHAR(20),
  @password_hash NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS(SELECT 1 FROM dbo.Usuarios WHERE email = @email)
  BEGIN
    RAISERROR('EMAIL_EXISTS', 16, 1);
    RETURN;
  END
  INSERT INTO dbo.Usuarios (nombre, email, rol, password_hash, activo)
  VALUES (@nombre, @email, @rol, @password_hash, 1);

  SELECT TOP 1 id, nombre, email, rol, activo FROM dbo.Usuarios WHERE email = @email;
END
