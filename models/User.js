const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor ingrese un nombre de usuario'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese un email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['Doctor', 'Admin', 'Nurse', 'Receptionist'],
    default: 'Admin'
  },
  specialty: {
    type: String,
    required: function() { return this.role === 'Doctor' || this.role === 'Nurse'; }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add this if using newer versions of Mongoose
userSchema.pre('remove', async function(next) {
  // Any cleanup before user removal can go here
  next();
});

module.exports = mongoose.model('User', userSchema);