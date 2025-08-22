import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  source: {
    type: String,
    enum: ['landing-page', 'contact-form', 'newsletter'],
    default: 'landing-page'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'replied', 'closed'],
    default: 'new'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejor performance
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });

// Método para obtener contactos recientes
contactSchema.statics.getRecentContacts = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({ 
    createdAt: { $gte: date } 
  }).sort({ createdAt: -1 });
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;