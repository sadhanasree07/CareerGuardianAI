import mongoose, {
  Schema,
  models,
  model,
} from "mongoose";

const UserSchema =
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
      },

      password: {
        type: String,
        required: true,
      },

      college: {
        type: String,
        default: "",
      },

      role: {
        type: String,
        default: "student",
      },

      verificationCount: {
        type: Number,
        default: 0,
      },

      resumeCount: {
        type: Number,
        default: 0,
      },

      interviewCount: {
        type: Number,
        default: 0,
      },

      badges: {
        type: [String],
        default: [],
      },
    },

    {
      timestamps: true,
    }
  );

const User =
  models.User ||
  model("User", UserSchema);

export default User;