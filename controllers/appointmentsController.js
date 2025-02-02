import appointments from "../models/appointments.model.js";
import doctorPatientAssignments from "../models/doctorPatientAssignments.model.js";
const createAppointment = async (req, res) => {

    try {
        const { patientId, doctorId, appointmentDate, purpose, notes } = req.body;
        const assignToDoctor = await doctorPatientAssignments.findOne({ patientId, doctorId });

        if (!assignToDoctor) {
            return res.status(400).json({ message: 'Doctor not assigned to patient' });
        }

        const previousAppointment = await appointments.findOne({ patientId, doctorId, appointmentDate });

        if (previousAppointment) {
            return res.status(400).json({ message: 'Appointment already exists' });
        }

        const newAppointment = new appointments({ patientId, doctorId, appointmentDate, purpose, notes });
        await newAppointment.save();
        return res.status(201).json({ message: 'Appointment created', appointment: newAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    
}

const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const appointmentsList = await appointments.find({ doctorId });
        if (!appointmentsList) {
            return res.status(404).json({ message: 'No appointments found' });
        }
        return res.status(200).json({ appointments: appointmentsList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;
        const appointmentsList = await appointments.find({ patientId });
        if (!appointmentsList) {
            return res.status(404).json({ message: 'No appointments found' });
        }
        return res.status(200).json({ appointments: appointmentsList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const editAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params.appointmentId;
        const { purpose, notes,statue, appointmentDate } = req.body;
        const appointment = await appointments.findByIdAndUpdate(appointmentId,{$set: 
            { purpose, notes,statue, appointmentDate }
        }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
       
        return res.status(200).json({ message: 'Appointment updated', appointment: appointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { createAppointment, getDoctorAppointments, getPatientAppointments, editAppointment };