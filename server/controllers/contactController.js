import Contact from '../models/Contact.js';
import { sendContactEmail } from '../services/emailService.js';

// Crear nuevo contacto
export const createContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Crear contacto en base de datos
    const contact = await Contact.create({
      name,
      email,
      message,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer')
      }
    });

    // Enviar email de notificación (opcional)
    try {
      await sendContactEmail({ name, email, message });
    } catch (emailError) {
      console.warn('Email notification failed:', emailError.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Contact form submitted successfully',
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          createdAt: contact.createdAt
        }
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Contact with this email already exists'
      });
    }

    next(error);
  }
};

// Obtener todos los contactos (solo para admin)
export const getContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    res.status(200).json({
      status: 'success',
      results: contacts.length,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};