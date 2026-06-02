import { CheckCircle, Clock, XCircle, type LucideIcon } from 'lucide-react';
import type { Order } from '@/store/configuratorStore';

export type OrderStatus = Order['status'];

export interface OrderStatusConfig {
  label: string;
  badgeClassName: string;
  Icon: LucideIcon;
  successPage: {
    iconCircleClassName: string;
    iconClassName: string;
    titleClassName: string;
    title: string;
    description: string;
  };
  lookupHint?: string;
}

export const orderStatusConfig: Record<OrderStatus, OrderStatusConfig> = {
  APROVADO: {
    label: 'Aprovado',
    badgeClassName: 'bg-green-100 text-green-700',
    Icon: CheckCircle,
    successPage: {
      iconCircleClassName: 'bg-success/10',
      iconClassName: 'text-success',
      titleClassName: 'text-success',
      title: 'Pedido Aprovado!',
      description: 'Seu pedido foi processado com sucesso. Em breve entraremos em contato.',
    },
  },
  REPROVADO: {
    label: 'Reprovado',
    badgeClassName: 'bg-red-100 text-red-700',
    Icon: XCircle,
    successPage: {
      iconCircleClassName: 'bg-destructive/10',
      iconClassName: 'text-destructive',
      titleClassName: 'text-destructive',
      title: 'Crédito Reprovado',
      description: 'Infelizmente seu crédito não foi aprovado. Tente novamente com pagamento à vista.',
    },
  },
  EM_ANALISE: {
    label: 'Em análise',
    badgeClassName: 'bg-amber-100 text-amber-800 border border-amber-200',
    Icon: Clock,
    successPage: {
      iconCircleClassName: 'bg-amber-100',
      iconClassName: 'text-amber-600',
      titleClassName: 'text-amber-700',
      title: 'Pedido em Análise',
      description: 'Seu pedido está sendo analisado. Você receberá uma atualização em breve.',
    },
    lookupHint: 'Seu pedido está sendo analisado. Você receberá uma atualização em breve.',
  },
};

export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  return orderStatusConfig[status];
}
