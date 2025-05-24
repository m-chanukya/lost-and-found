import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
    console.log('Starting email test...');
    
    // More detailed environment variable logging
    console.log('Environment Variables Check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'Not set ❌');
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set ✅' : 'Not set ❌');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error('Missing required environment variables. Please check your .env file');
    }

    // Create transporter with detailed logging
    console.log('\nCreating email transporter...');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        },
        debug: true, // Enable debug logging
        logger: true  // Log to console
    });

    console.log('\nVerifying transporter configuration...');
    try {
        await transporter.verify();
        console.log('Transporter verification successful! ✅');
    } catch (error) {
        console.error('Transporter verification failed! ❌');
        throw error;
    }

    // Test email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'chanukyaop@gmail.com',
        subject: 'Test Email from Campus Item Finder - ' + new Date().toISOString(),
        text: 'If you receive this email, the email configuration is working correctly.',
        html: `
            <h2>Test Email</h2>
            <p>If you receive this email, the email configuration is working correctly.</p>
            <p>Current time: ${new Date().toLocaleString()}</p>
        `
    };

    try {
        console.log('\nAttempting to send test email...');
        console.log('Sending to:', mailOptions.to);
        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully! ✅');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (err) {
        const error = err as Error & {
            code?: string;
            command?: string;
            response?: string;
        };

        console.error('\nError details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw error;
    }
}

console.log('🚀 Starting email test script...\n');
testEmail().catch(error => {
    console.error('\nFailed to send email:', error);
    process.exit(1);
}); 