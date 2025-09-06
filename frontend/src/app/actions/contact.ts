
'use server';

import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

export async function handleContactSubmit(
  values: z.infer<typeof contactFormSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsedData = contactFormSchema.parse(values);

    // In a real application, you would integrate with an email service (like Resend, SendGrid)
    // or a CRM/support tool here.
    // For this example, we'll just log it to the console.
    console.log('--- New Contact Form Submission ---');
    console.log('Name:', parsedData.name);
    console.log('Email:', parsedData.email);
    console.log('Message:', parsedData.message);
    console.log('---------------------------------');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    console.error('Error handling contact submission:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid data provided.' };
    }
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
