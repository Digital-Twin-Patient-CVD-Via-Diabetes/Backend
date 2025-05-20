
import doctors from '../models/doctors.model.js';
import patients from '../models/patients.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';


async function createTransporter() {
    return nodemailer.createTransport({
      host: process.env.HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
}

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await doctors.findOne({ email }) || await doctors.findOne({ phoneNumber: email });
    
    if (doctor) {
      const isPasswordValid = await bcrypt.compare(password, doctor.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!doctor.isVerified) {
        return res
          .status(403)
          .json({ message: 'Please verify your email before logging in.' });
      };
      const token = jwt.sign({ id: doctor._id, userType: "doctor" }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token, userType: "doctor" });
    }

    
    const patient = await patients.findOne({ email })|| await patients.findOne({ phoneNumber: email });
    if (patient) {
      const isPasswordValid = await bcrypt.compare(password, patient.password);
      if (!patient.isVerified) {
        return res
          .status(403)
          .json({ message: 'Please verify your email before logging in.' });
      };
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
    const transporter = await createTransporter();
    try {
        
        const existingUser = await patients.findOne({ email }) || await doctors.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
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
                verificationToken,
                verificationTokenExpires,
                isVerified: false,
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
                disease: "none",
                verificationToken,
                verificationTokenExpires,
                isVerified: false,
            });
        } else {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }
        const verifyUrl = `${req.protocol}://${req.get(
          'host'
        )}/api/auth/verify-email?token=${verificationToken}`;
        const info =await transporter.sendMail({
          from: `"dIACORD" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '🔒 Please verify your email',
          html: `
            <p>Hello ${name},</p>
            <p>Thanks for registering! Please verify your email by clicking the link below (expires in 24 hours):</p>
            <a href="${verifyUrl}">${verifyUrl}</a>
            <p>If you did not sign up, you can safely ignore this email.</p>
          `,
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.', error: error.message });
    }
};


// const forgetPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     const doctor = await doctors.findOne({ email });
//     const patient = await patients.findOne({ email });

//     let user;
//     let userType;
    
//     if (doctor) {
//       user = doctor;
//       userType = "doctor";
//     } else if (patient) {
//       user = patient;
//       userType = "patient";
//     } else {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     const resetLink = `http://yourfrontend.com/reset-password?token=${token}`;

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Password Reset',
//       text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
//     };

//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({ message: "Password reset link sent to your email" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// const createNewPassword = async (req, res) => {
//   try {
//     const { token, password } = req.body;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { id, userType } = decoded;

//     let user;
//     if (userType === "doctor") {
//       user = await doctors.findById(id);
//     } else if (userType === "patient") {
//       user = await patients.findById(id);
//     }

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     await user.save();

//     return res.status(200).json({ message: "Password reset successful" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Missing token.');
  }

  let user = await doctors.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    user = await patients.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
  }

  if (!user) {
    return res.status(400).send('Invalid or expired verification link.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  console.log(user);
  await user.save();
  res.status(200).send(`
    <html>
      <head>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          }
          img {
            max-width: 90%;
            height: auto;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h2>Welcome to Diacord</h2>
        <img src="https://global.discourse-cdn.com/auth0/original/3X/b/a/ba809125d9957f9f3aea9517796c4bfe328fd66b.png" alt="Verified Image" />
      </body>
    </html>
  `);
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user in either doctors or patients collection
    const doctor = await doctors.findOne({ email });
    const patient = await patients.findOne({ email });

    let user;
    let userType;
    
    if (doctor) {
      user = doctor;
      userType = 'doctor';
    } else if (patient) {
      user = patient;
      userType = 'patient';
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Create reset link pointing to front-end
    const resetLink = `https://diacordserver.onrender.com/src/reset-password.html?token=${token}`;

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}\nThis link expires in 1 hour.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error in forgetPassword:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createNewPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { id, userType } = decoded;

    // Find user based on userType
    let user;
    if (userType === 'doctor') {
      user = await doctors.findById(id);
    } else if (userType === 'patient') {
      user = await patients.findById(id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in createNewPassword:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  login,
  register,
  forgetPassword,
  createNewPassword,
  verifyEmail,
};