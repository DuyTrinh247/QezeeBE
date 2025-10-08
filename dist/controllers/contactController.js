"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactEmail = sendContactEmail;
const contactService_1 = require("../services/contactService");
const contactService = new contactService_1.ContactService();
async function sendContactEmail(req, res) {
    try {
        console.log('📧 Contact form submission received');
        const { firstName, lastName, email, feedbackType, message } = req.body;
        // Validate required fields
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'First name, last name, email, and message are required'
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }
        console.log('📋 Contact form data:', {
            firstName,
            lastName,
            email,
            feedbackType,
            messageLength: message.length
        });
        // Send email
        await contactService.sendContactEmail({
            firstName,
            lastName,
            email,
            feedbackType,
            message
        });
        console.log('✅ Contact email sent successfully');
        res.json({
            success: true,
            message: 'Your message has been sent successfully! We\'ll get back to you soon.'
        });
    }
    catch (error) {
        console.error('❌ Error sending contact email:', error);
        res.status(500).json({
            error: 'Failed to send message',
            details: error.message
        });
    }
}
