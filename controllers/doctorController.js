import doctors from "../models/doctors.model.js";
import doctorPatientAssignments from "../models/doctorPatientAssignments.model.js";
import patients from "../models/patients.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


export const getDoctorForPatient = async (req, res) => {
  try {
    const patientId = req.user.id;
    console.log(patientId);
    
    const assignment = await doctorPatientAssignments
      .find({ patientId })
      .select("doctorId") ;

    console.log(assignment)
    if (!assignment) {
  
      return res.status(404).json({ message: "No assigned doctor found" });
    }

    const doctor = await doctors
      .findById(assignment[assignment.length-1].doctorId)
      .select("_id name specialization email phoneNumber");

      console.log(doctor)
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ message: "Failed to retrieve doctor details", error: error.message });
  }
};

export const getDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log(doctorId);
    const doctor = await doctors.findById(doctorId).select(
      "_id name specialization email phoneNumber address"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ message: "Failed to retrieve doctor details", error: error.message });
  }
};

export const updateDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.user.id; 
    console.log(doctorId);

    
    const updates = req.body;  
    const updatedDoctor = await doctors.findByIdAndUpdate(doctorId, updates, { new: true, runValidators: true });

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor details:", error);
    res.status(500).json({ message: "Failed to update doctor details", error: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;  
    
    const deletedDoctor = await doctors.findByIdAndDelete(doctorId);

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Failed to delete doctor", error: error.message });
  }
};



export const ChangeDoctorPassword = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Find the patient
    const doctor = await doctors.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, doctor.password);
    if (!isMatch) {
      console.log(oldPassword)
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    doctor.password = hashedPassword;
    await doctor.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

export const ChangeDoctorEmail = async (req, res) =>{
  console.log("ChangePatientEmail called")
  try {
    const doctorId = req.user.id;
   
    const {password, email} = req.body;
   
    // Validate if it's a Gmail address
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid Gmail address" });
    }

    const doctor= await doctors.findById(doctorId);
    if(!doctor){
      return res.status(404).json({message:"Doctor not found"});
    }

    // Check if the new email is already in use
    const emailExist = await patients.findOne({ email }) || await doctors.findOne({ email });
    if(emailExist){
      return res.status(403).json({message:"Email already in use"});
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if(!isMatch){
      
      return res.status(401).json({message:"Invalid password"});
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { doctorId, newEmail: email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your New Email',
      text: `Please click the following link to verify your new email address: ${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Verification email sent. Please check your inbox." });
    
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({message:"Failed to update email", error:error.message});
  }
}

export const verifyNewEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { doctorId, newEmail } = decoded;

    // Update the patient's email
    const doctor = await doctors.findByIdAndUpdate(
      doctorId,
      { email: newEmail },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Failed to verify email", error: error.message });
  }
};
