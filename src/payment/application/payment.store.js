/**
 * Application service store for the Payment bounded context (buyer only).
 *
 * Persists demo payment data through the API and auto-generates an
 * invoice. It never mutates the Ordering store directly — the shared
 * coordination service flips the order's payment status after {@link payOrder}.
 *
 * @module usePaymentStore
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { PaymentApi } from "../infrastructure/payment-api.js";
import { PaymentAssembler, InvoiceAssembler } from "../infrastructure/payment.assembler.js";
import { Payment } from "../domain/model/payment.entity.js";
import { Invoice } from "../domain/model/invoice.entity.js";

const paymentApi = new PaymentApi();
const IGV_RATE = 0.18;

const usePaymentStore = defineStore('payment', () => {
    /** @type {import('vue').Ref<Payment[]>} */
    const payments = ref([]);
    /** @type {import('vue').Ref<Invoice[]>} */
    const invoices = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const loaded = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    function fetchPayments() {
        loading.value = true;
        return paymentApi.getPayments()
            .then(response => { payments.value = PaymentAssembler.toEntitiesFromResponse(response); })
            .catch(error => errors.value.push(error))
            .finally(() => { loading.value = false; });
    }

    function fetchInvoices() {
        return paymentApi.getInvoices()
            .then(response => { invoices.value = InvoiceAssembler.toEntitiesFromResponse(response); loaded.value = true; })
            .catch(error => errors.value.push(error));
    }

    /** @param {number} companyId @returns {Payment[]} */
    function paymentsForBuyer(companyId) {
        return payments.value.filter(p => p.companyId === companyId);
    }

    /** @param {number} companyId @returns {Invoice[]} */
    function invoicesForBuyer(companyId) {
        return invoices.value.filter(i => {
            const payment = payments.value.find(p => p.id === i.paymentId);
            return payment ? payment.companyId === companyId : false;
        });
    }

    /** Whether an order already has a completed payment. */
    function isOrderPaid(orderId) {
        return payments.value.some(p => p.orderId === orderId && p.status === 'COMPLETED');
    }

    function nextInvoiceNumber() {
        const seq = invoices.value.length + 126;
        return `F001-${String(seq).padStart(8, '0')}`;
    }

    /**
     * Pays an order by persisting a payment and an auto-generated
     * invoice with IGV breakdown.
     *
     * @param {{ order:Object, method:string, card:Object, buyer:Object, provider:Object }} params
     * @returns {Promise<{ payment:Payment, invoice:Invoice }|null>}
     */
    async function payOrder({ order, method, card, buyer, provider }) {
        const total = Number(order.totalAmount) || 0;
        const subtotal = Math.round((total / (1 + IGV_RATE)) * 100) / 100;
        const igv = Math.round((total - subtotal) * 100) / 100;
        const now = new Date().toISOString();

        const paymentDraft = new Payment({
            orderId: order.id,
            companyId: order.companyId ?? order.clientId,
            providerId: order.providerId,
            method,
            amount: total,
            status: 'COMPLETED',
            maskedCard: method === 'CARD' ? `**** **** **** ${(card?.number ?? '0000').slice(-4)}` : '',
            cardHolder: method === 'CARD' ? (card?.holder ?? '') : (card?.phone ?? ''),
            reference: `TXN-${Date.now()}`,
            createdAt: now,
        });

        const invoiceDraft = new Invoice({
            paymentId: null,
            orderId: order.id,
            invoiceNumber: nextInvoiceNumber(),
            providerRuc: provider?.ruc ?? '',
            providerName: provider?.name ?? '',
            buyerRuc: buyer?.ruc ?? '',
            buyerName: buyer?.name ?? '',
            fuelType: order.fuelType,
            quantity: order.quantity,
            unit: order.unit,
            unitPrice: order.unitPrice ?? (order.quantity ? subtotal / order.quantity : 0),
            subtotal,
            igv,
            total,
            issueDate: now,
            status: 'PAID',
        });

        try {
            const response = await paymentApi.checkout(paymentDraft, invoiceDraft);
            const payment = PaymentAssembler.toEntityFromResource(response.data.payment);
            const invoice = InvoiceAssembler.toEntityFromResource(response.data.invoice);
            payments.value.push(payment);
            invoices.value.push(invoice);

            return { payment, invoice };
        } catch (error) {
            errors.value.push(error);
            return null;
        }
    }

    function clearErrors() { errors.value = []; }

    return {
        payments,
        invoices,
        loaded,
        loading,
        errors,
        fetchPayments,
        fetchInvoices,
        paymentsForBuyer,
        invoicesForBuyer,
        isOrderPaid,
        payOrder,
        clearErrors,
    };
});

export default usePaymentStore;
