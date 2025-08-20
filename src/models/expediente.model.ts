export interface Expediente {
  id: string;
  codigo: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  tecnico_id: string;
  aprobador_id?: string | null;
  fecha_estado?: string | null;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}
