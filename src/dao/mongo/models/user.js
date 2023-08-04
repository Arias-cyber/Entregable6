import mongoose from "mongoose";

const collection = "Users";

const schema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    email:String,
    password:String,
  //  rol: { type: String, default: 'user', select: false },

})
schema.pre('save', function (next) {
    if (this.isNew || this.isModified('rol')) {
      this.rol = this.rol || 'user';
    }
    next();
  });
// Omitir el campo "rol" en las consultas por defecto
schema.set('toJSON', { getters: true, virtuals: false });
schema.set('toObject', { getters: true, virtuals: false });

  
  
const userModel = mongoose.model(collection,schema);

export default userModel;