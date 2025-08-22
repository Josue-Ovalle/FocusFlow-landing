import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'unsubscribed'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['landing-page', 'newsletter', 'promotion'],
    default: 'landing-page'
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    signupPage: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
subscriptionSchema.index({ email: 1 }, { unique: true });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Método para verificar si email ya está suscrito
subscriptionSchema.statics.isSubscribed = async function(email) {
  const subscription = await this.findOne({ 
    email: email.toLowerCase(), 
    status: 'active' 
  });
  return !!subscription;
};

// Método para desuscribir
subscriptionSchema.methods.unsubscribe = function() {
  this.status = 'unsubscribed';
  return this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;