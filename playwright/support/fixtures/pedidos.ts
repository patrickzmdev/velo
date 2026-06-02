import { Pedido } from "../interface/Pedido";

export const objetoPedidoAprovado: Pedido = {
    numero: 'VLO-ULGOAW',
    status: 'Aprovado',
    modelo: 'Velô Sprint',
    cor: 'Glacier Blue',
    interior: 'cream',
    rodas: 'aero',
    cliente: {
      nome: 'Patrick',
      email: 'teste@teste.com',
      data: '15/05/2026',
    },
  };
  
  export const objetoPedidoReprovado: Pedido = {
    numero: 'VLO-2PP21D',
    status: 'Reprovado',
    modelo: 'Velô Sprint',
    cor: 'Lunar White',
    interior: 'cream',
    rodas: 'sport',
    cliente: {
      nome: 'Joao Pedro',
      email: 'teste2@teste.com',
      data: '01/06/2026',
    },
  };
  
  export const objetoPedidoEmAnalise: Pedido = {
    numero: 'VLO-D6HPCX',
    status: 'Em análise',
    modelo: 'Velô Sprint',
    cor: 'Midnight Black',
    interior: 'cream',
    rodas: 'aero',
    cliente: {
      nome: 'Marcio',
      email: 'teste3@teste.com',
      data: '01/06/2026',
    }
  };