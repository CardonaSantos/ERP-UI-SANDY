export interface ResolverReglaContableResponse {
  id: number;
  codigo: string;
  nombre: string;

  cuentaDebeId: number;
  cuentaHaberId: number;

  prioridad: number;
}
