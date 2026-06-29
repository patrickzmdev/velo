import { Order } from "../interface/Order";
const statusOptions = ['Aprovado', 'Reprovado', 'Em análise'];

export const orderApproved: Order = {
    number: 'VLO-ULGOAW',
    status: statusOptions[0],
    model: 'Velô Sprint',
    color: 'Glacier Blue',
    interior: 'cream',
    wheels: 'aero',
    customer: {
      name: 'Patrick',
      email: 'teste@teste.com',
      date: '15/05/2026',
    },
  };

  export const orderRejected: Order = {
    number: 'VLO-2PP21D',
    status: statusOptions[1],
    model: 'Velô Sprint',
    color: 'Lunar White',
    interior: 'cream',
    wheels: 'sport',
    customer: {
      name: 'Joao Pedro',
      email: 'teste2@teste.com',
      date: '01/06/2026',
    },
  };

  export const orderUnderReview: Order = {
    number: 'VLO-D6HPCX',
    status: statusOptions[2],
    model: 'Velô Sprint',
    color: 'Midnight Black',
    interior: 'cream',
    wheels: 'aero',
    customer: {
      name: 'Marcio',
      email: 'teste3@teste.com',
      date: '01/06/2026',
    }
  };
