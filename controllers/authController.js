
import doctors from '../models/doctors.model.js';
import patients from '../models/patients.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';




const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const doctor = await doctors.findOne({ email });
    if (doctor) {
      const isPasswordValid = await bcrypt.compare(password, doctor.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: doctor._id, userType: "doctor" }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token, userType: "doctor" });
    }

    
    const patient = await patients.findOne({ email });
    if (patient) {
      const isPasswordValid = await bcrypt.compare(password, patient.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: patient._id, userType: "patient" }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token, userType: "patient" });
    }

    
    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

const register = async (req, res) => {
    const { role, email, password, name, specialization, phoneNumber, address,gender,
                birthDate } = req.body;

    try {
        
        const existingUser = await patients.findOne({ email }) || await doctors.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role === 'doctor') {
            newUser = new doctors({
                name,
                email,
                specialization,
                phoneNumber,
                gender,
                birthDate,
                address,
                password: hashedPassword,
            });
        } else if (role === 'patient') {
            newUser = new patients({
                name,
                email,
                phoneNumber,
                gender,
                birthDate,
                address,
                password: hashedPassword,
            });
        } else {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }

       
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.', error: error.message });
    }
};


const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const doctor = await doctors.findOne({ email });
    const patient = await patients.findOne({ email });

    let user;
    let userType;
    
    if (doctor) {
      user = doctor;
      userType = "doctor";
    } else if (patient) {
      user = patient;
      userType = "patient";
    } else {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `http://yourfrontend.com/reset-password?token=${token}`;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default {
  login,
  register,
  forgetPassword,
};