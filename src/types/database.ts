export interface Database {
  public: {
    Tables: {
      activos: {
        Row: {
          id: string;
          codigo_qr: string;
          nombre_equipo: string;
          costo_inicial: number;
          valor_rescate: number;
          vida_util_anos: number;
          sucursal_id: string;
          estado: string;
          fecha_compra: string;
          ultima_modificacion: string;
        };
        Insert: Omit<Database["public"]["Tables"]["activos"]["Row"], "id" | "ultima_modificacion">;
        Update: Partial<Database["public"]["Tables"]["activos"]["Row"]>;
      };
      sucursales: {
        Row: {
          id: string;
          nombre: string;
          ciudad: string;
          creado_en: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sucursales"]["Row"], "id" | "creado_en">;
        Update: Partial<Database["public"]["Tables"]["sucursales"]["Row"]>;
      };
    };
    Views: {
      reporte_depreciacion: {
        Row: {
          id: string;
          nombre_equipo: string;
          costo_inicial: number;
          valor_rescate: number;
          vida_util_anos: number;
          fecha_compra: string;
          depreciacion_anual: number;
          anos_transcurridos: number;
          valor_actual_contable: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Activo = Database["public"]["Tables"]["activos"]["Row"];
export type Sucursal = Database["public"]["Tables"]["sucursales"]["Row"];
export type ReporteDepreciacion = Database["public"]["Views"]["reporte_depreciacion"]["Row"];
