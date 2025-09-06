import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, subject, message, to, websiteId } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email via Resend (with dev fallback)
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      const isDevFallback = process.env.NODE_ENV !== 'production' || process.env.EMAIL_DISABLED === 'true'
      console.warn('Support API: RESEND_API_KEY not set. Email sending disabled.', { isDevFallback })
      if (isDevFallback) {
        console.log('Support request (dev stub):', { firstName, lastName, email, subject, message, to, websiteId })
        return NextResponse.json(
          {
            message: 'Support request received (email disabled in dev).',
            id: Date.now().toString(),
            emailSent: false,
          },
          { status: 200 }
        )
      }
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const toEmail = process.env.SUPPORT_EMAIL || to || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@seentics.com'
    const fromEmail = process.env.RESEND_FROM || process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || 'noreply@seentics.com'

    const emailPayload = {
      from: fromEmail,
      to: [toEmail],
      subject: `[Support] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height:1.6; color:#111">
          <h2 style="margin:0 0 12px">New Support Request</h2>
          <p style="margin:0 0 8px"><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
          ${websiteId ? `<p style="margin:0 0 8px"><strong>Website ID:</strong> ${websiteId}</p>` : ''}
          <p style="margin:16px 0 8px"><strong>Subject:</strong> ${subject}</p>
          <p style="white-space:pre-wrap; margin:8px 0 0">${String(message || '')}</p>
        </div>
      `,
      text: `New Support Request\nFrom: ${firstName} ${lastName} (${email})${websiteId ? `\nWebsite ID: ${websiteId}` : ''}\nSubject: ${subject}\n\n${String(message || '')}`,
      reply_to: email,
    }

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!resendResp.ok) {
      const errText = await resendResp.text()
      console.error('Resend error:', resendResp.status, errText)
      return NextResponse.json(
        { error: 'Failed to send support email' },
        { status: 502 }
      )
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Support request received successfully',
        id: Date.now().toString()
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Support API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
