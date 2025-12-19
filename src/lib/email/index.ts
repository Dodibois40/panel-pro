/**
 * Service d'envoi d'emails
 * Note: Nécessite la configuration d'un provider email (Resend, SendGrid, etc.)
 */

export * from './templates'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Envoie un email
 * À configurer avec votre provider email préféré
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // Pour le développement, on log simplement l'email
  if (process.env.NODE_ENV === 'development') {
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📧 EMAIL (dev mode - non envoyé)')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('───────────────────────────────────────────────────────────────')
    console.log(options.text)
    console.log('═══════════════════════════════════════════════════════════════')
    return { success: true }
  }

  // En production, utilisez votre provider email
  // Exemple avec Resend:
  /*
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Panel Pro <noreply@panel-pro.fr>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error: String(error) }
  }
  */

  // Par défaut, on simule l'envoi
  console.log(`Email envoyé à ${options.to}: ${options.subject}`)
  return { success: true }
}

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmation(
  email: string,
  data: {
    orderNumber: string
    customerName: string
    projectName?: string | null
    totalHT: number
    totalTTC: number
    partsCount: number
    orderId: string
  }
) {
  const { orderConfirmationEmail } = await import('./templates')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const template = orderConfirmationEmail({
    ...data,
    orderUrl: `${baseUrl}/commande/${data.orderId}`,
  })

  return sendEmail({
    to: email,
    ...template,
  })
}

/**
 * Envoie un email de changement de statut
 */
export async function sendOrderStatusUpdate(
  email: string,
  data: {
    orderNumber: string
    customerName: string
    projectName?: string | null
    totalHT: number
    totalTTC: number
    partsCount: number
    orderId: string
    newStatus: string
  }
) {
  const { orderStatusEmail, orderReadyEmail } = await import('./templates')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Email spécial pour commande prête
  if (data.newStatus === 'READY') {
    const template = orderReadyEmail({
      ...data,
      orderUrl: `${baseUrl}/commande/${data.orderId}`,
      pickupAddress: 'Panel Pro - 123 Rue de l\'Industrie, 75011 Paris',
    })
    return sendEmail({ to: email, ...template })
  }

  const template = orderStatusEmail({
    ...data,
    orderUrl: `${baseUrl}/commande/${data.orderId}`,
    statusMessage: '',
  })

  return sendEmail({
    to: email,
    ...template,
  })
}
