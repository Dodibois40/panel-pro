/**
 * Templates email pour les notifications
 */

interface OrderEmailData {
  orderNumber: string
  customerName: string
  projectName?: string | null
  totalHT: number
  totalTTC: number
  partsCount: number
  orderUrl: string
}

interface StatusEmailData extends OrderEmailData {
  newStatus: string
  statusMessage: string
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES COMMUNS
// ═══════════════════════════════════════════════════════════════════════════

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  .header { background-color: #0066cc; color: white; padding: 32px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
  .header p { margin: 8px 0 0; opacity: 0.9; }
  .content { padding: 32px; }
  .footer { background-color: #f9fafb; padding: 24px 32px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  .button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
  .button:hover { background-color: #0052a3; }
  .info-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #6b7280; }
  .info-value { font-weight: 600; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; }
  .status-confirmed { background-color: #dbeafe; color: #1d4ed8; }
  .status-production { background-color: #f3e8ff; color: #7c3aed; }
  .status-ready { background-color: #dcfce7; color: #16a34a; }
  .total { font-size: 24px; font-weight: bold; color: #0066cc; }
`

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE: CONFIRMATION COMMANDE
// ═══════════════════════════════════════════════════════════════════════════

export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `Confirmation de commande ${data.orderNumber} - Panel Pro`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Panel Pro</h1>
      <p>Découpe de panneaux sur mesure</p>
    </div>

    <div class="content">
      <h2>Merci pour votre commande !</h2>

      <p>Bonjour ${data.customerName},</p>

      <p>Nous avons bien reçu votre commande et nous vous en remercions. Voici le récapitulatif :</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">N° de commande</span>
          <span class="info-value">${data.orderNumber}</span>
        </div>
        ${data.projectName ? `
        <div class="info-row">
          <span class="info-label">Projet</span>
          <span class="info-value">${data.projectName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Nombre de pièces</span>
          <span class="info-value">${data.partsCount}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total HT</span>
          <span class="info-value">${data.totalHT.toFixed(2)} €</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total TTC</span>
          <span class="total">${data.totalTTC.toFixed(2)} €</span>
        </div>
      </div>

      <p>Nous allons traiter votre commande dans les plus brefs délais. Vous recevrez un email dès que celle-ci sera en production.</p>

      <div style="text-align: center;">
        <a href="${data.orderUrl}" class="button">Voir ma commande</a>
      </div>

      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

      <p>Cordialement,<br>L'équipe Panel Pro</p>
    </div>

    <div class="footer">
      <p>Panel Pro - Découpe de panneaux sur mesure</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Confirmation de commande - Panel Pro

Bonjour ${data.customerName},

Nous avons bien reçu votre commande et nous vous en remercions.

Récapitulatif :
- N° de commande : ${data.orderNumber}
${data.projectName ? `- Projet : ${data.projectName}` : ''}
- Nombre de pièces : ${data.partsCount}
- Total HT : ${data.totalHT.toFixed(2)} €
- Total TTC : ${data.totalTTC.toFixed(2)} €

Voir ma commande : ${data.orderUrl}

Nous allons traiter votre commande dans les plus brefs délais.

Cordialement,
L'équipe Panel Pro
`

  return { subject, html, text }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE: CHANGEMENT DE STATUT
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_INFO: Record<string, { label: string; class: string; message: string }> = {
  CONFIRMED: {
    label: 'Confirmée',
    class: 'status-confirmed',
    message: 'Votre commande a été confirmée et sera bientôt mise en production.',
  },
  IN_PRODUCTION: {
    label: 'En production',
    class: 'status-production',
    message: 'Bonne nouvelle ! Votre commande est maintenant en cours de fabrication.',
  },
  READY: {
    label: 'Prête',
    class: 'status-ready',
    message: 'Votre commande est terminée et prête à être récupérée ou expédiée !',
  },
  SHIPPED: {
    label: 'Expédiée',
    class: 'status-confirmed',
    message: 'Votre commande a été expédiée. Vous la recevrez bientôt !',
  },
  DELIVERED: {
    label: 'Livrée',
    class: 'status-ready',
    message: 'Votre commande a été livrée. Nous espérons qu\'elle vous satisfait !',
  },
}

export function orderStatusEmail(data: StatusEmailData): { subject: string; html: string; text: string } {
  const statusInfo = STATUS_INFO[data.newStatus] || {
    label: data.newStatus,
    class: 'status-confirmed',
    message: data.statusMessage,
  }

  const subject = `Commande ${data.orderNumber} - ${statusInfo.label}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Panel Pro</h1>
      <p>Mise à jour de votre commande</p>
    </div>

    <div class="content">
      <h2>Mise à jour de votre commande</h2>

      <p>Bonjour ${data.customerName},</p>

      <p>Le statut de votre commande <strong>${data.orderNumber}</strong> a été mis à jour :</p>

      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
      </div>

      <div class="info-box">
        <p style="margin: 0;">${statusInfo.message}</p>
      </div>

      <div class="info-box" style="background-color: #f9fafb; border-color: #e5e7eb;">
        <div class="info-row">
          <span class="info-label">N° de commande</span>
          <span class="info-value">${data.orderNumber}</span>
        </div>
        ${data.projectName ? `
        <div class="info-row">
          <span class="info-label">Projet</span>
          <span class="info-value">${data.projectName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Nombre de pièces</span>
          <span class="info-value">${data.partsCount}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.orderUrl}" class="button">Suivre ma commande</a>
      </div>

      <p>Cordialement,<br>L'équipe Panel Pro</p>
    </div>

    <div class="footer">
      <p>Panel Pro - Découpe de panneaux sur mesure</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Mise à jour de votre commande - Panel Pro

Bonjour ${data.customerName},

Le statut de votre commande ${data.orderNumber} a été mis à jour :
Nouveau statut : ${statusInfo.label}

${statusInfo.message}

Suivre ma commande : ${data.orderUrl}

Cordialement,
L'équipe Panel Pro
`

  return { subject, html, text }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE: COMMANDE PRÊTE (SPECIAL)
// ═══════════════════════════════════════════════════════════════════════════

export function orderReadyEmail(data: OrderEmailData & { pickupAddress?: string }): { subject: string; html: string; text: string } {
  const subject = `Votre commande ${data.orderNumber} est prête ! - Panel Pro`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background-color: #16a34a;">
      <h1>🎉 Votre commande est prête !</h1>
      <p>Panel Pro</p>
    </div>

    <div class="content">
      <p>Bonjour ${data.customerName},</p>

      <p>Excellente nouvelle ! Votre commande <strong>${data.orderNumber}</strong> est maintenant <strong>prête</strong> et vous attend.</p>

      ${data.pickupAddress ? `
      <div class="info-box" style="background-color: #dcfce7; border-color: #86efac;">
        <h3 style="margin-top: 0;">📍 Adresse de retrait</h3>
        <p style="margin-bottom: 0;">${data.pickupAddress}</p>
      </div>
      ` : ''}

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">N° de commande</span>
          <span class="info-value">${data.orderNumber}</span>
        </div>
        ${data.projectName ? `
        <div class="info-row">
          <span class="info-label">Projet</span>
          <span class="info-value">${data.projectName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Nombre de pièces</span>
          <span class="info-value">${data.partsCount}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total TTC</span>
          <span class="total">${data.totalTTC.toFixed(2)} €</span>
        </div>
      </div>

      <p><strong>Pensez à apporter :</strong></p>
      <ul>
        <li>Une pièce d'identité</li>
        <li>Le numéro de commande : ${data.orderNumber}</li>
        <li>Un moyen de paiement si le règlement n'a pas été effectué</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.orderUrl}" class="button" style="background-color: #16a34a;">Voir les détails</a>
      </div>

      <p>À très bientôt !<br>L'équipe Panel Pro</p>
    </div>

    <div class="footer">
      <p>Panel Pro - Découpe de panneaux sur mesure</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Votre commande est prête ! - Panel Pro

Bonjour ${data.customerName},

Excellente nouvelle ! Votre commande ${data.orderNumber} est maintenant prête.

${data.pickupAddress ? `Adresse de retrait : ${data.pickupAddress}` : ''}

Récapitulatif :
- N° de commande : ${data.orderNumber}
- Nombre de pièces : ${data.partsCount}
- Total TTC : ${data.totalTTC.toFixed(2)} €

Pensez à apporter une pièce d'identité et le numéro de commande.

Voir les détails : ${data.orderUrl}

À très bientôt !
L'équipe Panel Pro
`

  return { subject, html, text }
}
