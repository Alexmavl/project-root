export interface Indicio {
  id: string;
  expediente_id: string;
  codigo: string;
  descripcion: string;
  peso: number;
  color?: string | null;
  tamano?: string | null;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}
