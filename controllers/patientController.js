import patients from "../models/patients.model.js";
import doctorPatientAssignment from "../models/doctorPatientAssignments.model.js";
import appointments from "../models/appointments.model.js";
import medications from "../models/medications.model.js";
import healthMetrics from "../models/healthmetricsModel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import doctors from "../models/doctors.model.js";
import crypto from "crypto";


export const assignPatient = async (req, res) => {
  const { name, gender, birthDate, phoneNumber } = req.body;
  const doctorId = req.user.id;
  const hashedPassword = await bcrypt.hash(phoneNumber, 10);
  try {
    
    const isDoctor = req.user.userType === "doctor";
    if (!isDoctor) {
      return res.status(403).json({ message: "Only doctors can assign patients." });
    }

    
    let existingPatient = await patients.findOne({ phoneNumber: phoneNumber });

    if (!existingPatient) {
      
      existingPatient = new patients({
        name,
        gender,
        birthDate: birthDate,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        disease: "none",
        email:phoneNumber+"@gmail.com",
        isVerified: true,
      });
      await existingPatient.save();
    }
    const newAssignment = new doctorPatientAssignment({
      doctorId,
      patientId: existingPatient._id,
      startDate: new Date(),
    });

    
    await newAssignment.save();

    
    res.status(201).json({
      message: "Patient assigned successfully",
      patient: existingPatient,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign patient", error: error.message });
  }
};

export const getLinkedPatients = async (req, res) => {
  try {
    
    const doctorId = req.user.id; 
    
    
    const assignments = await doctorPatientAssignment.find({ doctorId }).select("patientId");
    console.log(assignments);
    const patientIds = assignments.map((assignment) => assignment.patientId);

    
    const linkedPatients = await patients.find({ _id: { $in: patientIds } }).select(
       "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory disease"
    );
    console.log(linkedPatients);

    
    const patientDataWithDetails = await Promise.all(
      linkedPatients.map(async (patient) => {
        const patientAppointments = await appointments.find({ patientId: patient._id });
        const patientMedications = await medications.find({ patientId: patient._id });
        const patienthealthMetrics = await healthMetrics.find({ patientId: patient._id });

        return {
          ...patient.toObject(),
          appointments: patientAppointments,
          medications: patientMedications,
          healthMetrics: patienthealthMetrics,
        };
      })
    );
    console.log(patientDataWithDetails);
    res.status(200).json(patientDataWithDetails);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve patients", error: error.message });
  }
};

export const getPatientDetails = async (req, res) => {
  try {
    const patientId = req.user.id;
    console.log(patientId);
    const patient = await patients.findById(patientId).select(
      "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory disease"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ message: "Failed to retrieve patient details", error: error.message });
  }
};


export const updatePatientDetails = async (req, res) => {
  try {
    const patientId = req.user.id; 

    
    const updates = req.body;
    const updatedPatient = await patients.findByIdAndUpdate(patientId, updates, { new: true, runValidators: true });

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(updatedPatient); 
  } catch (error) {
    console.error("Error updating patient details:", error);
    res.status(500).json({ message: "Failed to update patient details", error: error.message });
  }
};

export const ChangePatientPassword = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Find the patient
    const patient = await patients.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, patient.password);
    if (!isMatch) {
      console.log(oldPassword)
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    patient.password = hashedPassword;
    await patient.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

// export const ChangePatientEmail = async (req, res) =>{
//   console.log("ChangePatientEmail called")
//   try {
//     const patientId = req.user.id;
   
//     const {password, email} = req.body;
   
//     // Validate if it's a Gmail address
//     const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     if (!gmailRegex.test(email)) {
//       return res.status(400).json({ message: "Please provide a valid Gmail address" });
//     }

//     const patient = await patients.findById(patientId);
//     if(!patient){
//       return res.status(404).json({message:"Patient not found"});
//     }

//     // Check if the new email is already in use
//     const emailExist = await patients.findOne({ email }) || await doctors.findOne({ email });
//     if(emailExist){
//       return res.status(403).json({message:"Email already in use"});
//     }

//     const isMatch = await bcrypt.compare(password, patient.password);
//     if(!isMatch){
      
//       return res.status(401).json({message:"Invalid password"});
//     }

//     // Generate verification token
//     const verificationToken = jwt.sign(
//       { patientId, newEmail: email },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // Configure nodemailer
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Verify Your New Email',
//       text: `Please click the following link to verify your new email address: ${verificationLink}`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: "Verification email sent. Please check your inbox." });
    
//   } catch (error) {
//     console.error("Error updating email:", error);
//     res.status(500).json({message:"Failed to update email", error:error.message});
//   }
// }

// export const verifyNewEmail = async (req, res) => {
//   try {
//     const { token } = req.params;
    
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { patientId, newEmail } = decoded;

//     // Update the patient's email
//     const patient = await patients.findByIdAndUpdate(
//       patientId,
//       { email: newEmail },
//       { new: true }
//     );

//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     res.status(200).json({ message: "Email updated successfully" });
//   } catch (error) {
//     console.error("Error verifying email:", error);
//     res.status(500).json({ message: "Failed to verify email", error: error.message });
//   }
// };




export const ChangePatientEmail = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { password, email } = req.body;

    // Validate Gmail
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid Gmail address" });
    }

    const patient = await patients.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if email is already in use
    const emailExist = await patients.findOne({ email }) || await doctors.findOne({ email });
    if (emailExist) {
      return res.status(403).json({ message: "Email already in use" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token and expiry
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store token and new email temporarily
    patient.verificationToken = verificationToken;
    patient.verificationTokenExpires = verificationTokenExpires;
    patient.pendingEmail = email;
    await patient.save();

    // Build verification URL dynamically
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/patient/verify-email?token=${verificationToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"dIACORD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Please verify your email',
      html: `
        <p>Hello ${patient.name},</p>
        <p>Thanks for updating your email! Please verify your new email by clicking the link below (expires in 1 hour):</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    res.status(200).json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Failed to update email", error: error.message });
  }
};

export const verifyNewEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Missing token.');
  }

  let user = await patients.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send('Invalid or expired verification link.');
  }

  // If pendingEmail exists, update email
  if (user.pendingEmail) {
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
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


export const deletePatient = async (req, res) => {
  try {
    const patientId = req.user.id; 
    const deletedPatient = await patients.findByIdAndDelete(patientId);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient deleted successfully" }); 
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ message: "Failed to delete patient", error: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params; 
    
    const patient = await patients.findById(patientId).select(
      "_id name gender birthDate email phoneNumber address emergencyContact anchorAge isPregnant isAlcoholUser diabetesPedigree heightCm admissionWeightKg isSmoker admissionSBP admissionDBP admissionSOH ckdFamilyHistory"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    res.status(500).json({ message: "Failed to retrieve patient", error: error.message });
  }
};