/**
 * Enviar email de boas-vindas ao usuário
 */
export declare function sendWelcomeEmail(userEmail: string, userName: string): Promise<void>;
/**
 * Enviar confirmação de assinatura ao usuário
 */
export declare function sendSubscriptionConfirmation(userEmail: string, userName: string, planName: string, planPrice: number, billingCycle?: string, invoiceId?: string): Promise<void>;
/**
 * Enviar confirmação de renovação com recibo ao usuário
 */
export declare function sendSubscriptionRenewal(userEmail: string, userName: string, planName: string, planPrice: number, invoiceId: string, invoiceDate: string, nextBillingDate: string, billingCycle?: string): Promise<void>;
/**
 * Enviar notificação de cancelamento ao admin
 */
export declare function notifyAdminCancellation(userEmail: string, reason: string, details: string, improvements: string, wouldReturn: boolean | null, feedbackId: number): Promise<void>;
/**
 * Enviar confirmação ao usuário sobre cancelamento
 */
export declare function confirmCancellationToUser(userEmail: string, endDate: string): Promise<void>;
//# sourceMappingURL=emailNotifications.d.ts.map