export interface Pedido {
  numero: string;
  status: string;
  modelo: string;
  cor: string;
  interior: string;
  rodas: string;
  cliente: {
    nome: string;
    email: string;
    data: string;
  };
}