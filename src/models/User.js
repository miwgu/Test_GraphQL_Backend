const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "USER"], required: true },
  favorites: [{type: mongoose.Schema.Types.ObjectId, ref: "Book"}] // Show favorites
});

/* // Hash the password before saving the user document
userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Method to check if the password matches
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
}; */

userSchema.index({email:1});

userSchema.set("toObject", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;