import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Payment } from '../types';

export interface PaymentGatewayInitiateInput {
  orderId: string;
  amount: number;
  paymentMethod: Payment['payment_method'];
}

export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      throw new Error(error.message);
    }
    return (data || []) as Payment[];
  },

  async recordPayment(payment: {
    order_id: string;
    amount: number;
    payment_method: Payment['payment_method'];
    payment_status?: Payment['payment_status'];
    transaction_id?: string;
    gateway_reference?: string;
  }): Promise<Payment> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const txnId = payment.transaction_id || `TXN-${payment.payment_method}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const ref = payment.gateway_reference || `GATEWAY_REF_${Math.floor(100000 + Math.random() * 900000)}`;

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        order_id: payment.order_id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_status: payment.payment_status || 'Completed',
        transaction_id: txnId,
        gateway_reference: ref
      }])
      .select()
      .single();

    if (error) {
      console.error('Error recording payment:', error);
      throw new Error(error.message);
    }
    return data as Payment;
  },

  async processPayment(input: PaymentGatewayInitiateInput): Promise<{
    success: boolean;
    transactionId: string;
    gatewayReference: string;
  }> {
    const txnId = `TXN-${input.paymentMethod}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const ref = `PAY_GATEWAY_${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      transactionId: txnId,
      gatewayReference: ref
    };
  }
};
