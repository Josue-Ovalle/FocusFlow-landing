import Subscription from '../models/Subscription.js';
import { sendWelcomeEmail } from '../services/emailService.js';

// Crear nueva suscripción
export const createSubscription = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verificar si ya está suscrito
    const existingSubscription = await Subscription.isSubscribed(email);
    if (existingSubscription) {
      return res.status(409).json({
        status: 'error',
        message: 'Email is already subscribed'
      });
    }

    // Crear suscripción
    const subscription = await Subscription.create({
      email,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        signupPage: req.get('Referrer') || 'landing-page'
      }
    });

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(email);
    } catch (emailError) {
      console.warn('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Successfully subscribed to newsletter',
      data: {
        subscription: {
          id: subscription._id,
          email: subscription.email,
          createdAt: subscription.createdAt
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

    next(error);
  }
};

// Cancelar suscripción
export const cancelSubscription = async (req, res, next) => {
  try {
    const { email } = req.params;

    const subscription = await Subscription.findOne({ 
      email: email.toLowerCase() 
    });

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found'
      });
    }

    await subscription.unsubscribe();

    res.status(200).json({
      status: 'success',
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    next(error);
  }
};