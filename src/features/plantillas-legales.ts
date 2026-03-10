export interface PlantillaLegalCredito {
  id: number;
  tipo: TipoPlantillaLegal;
  nombre: string;
  contenido: string;
  version: string;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}
export enum TipoPlantillaLegal {
  CONTRATO = "CONTRATO",
  PAGARE = "PAGARE",
}

export interface CreatePlantillaLegalDto {
  tipo: TipoPlantillaLegal;
  nombre: string;
  contenido: string;
  version: string;
  activa?: boolean;
}

export interface UpdatePlantillaLegalDto {
  tipo?: TipoPlantillaLegal;
  nombre?: string;
  contenido?: string;
  version?: string;
  activa?: boolean;
}
