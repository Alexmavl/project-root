export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'tecnico' | 'coordinador';
  activo: boolean;
  password_hash?: string;
  creado_en?: string;
  actualizado_en?: string;
}
