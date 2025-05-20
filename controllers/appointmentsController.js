import appointments from "../models/appointments.model.js";
import doctorPatientAssignments from "../models/doctorPatientAssignments.model.js";
import doctors from "../models/doctors.model.js";
import patients from "../models/patients.model.js";

import moment from 'moment';

const createAppointment = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { patientId, appointmentDate, appointmentTime, purpose, notes } = req.body;
        const assignToDoctor = await doctorPatientAssignments.findOne({ patientId, doctorId });

        if (!assignToDoctor) {
            return res.status(400).json({ message: 'Doctor not assigned to patient' });
        }
        const patientName = await patients.findById(patientId);
        const doctorName = await doctors.findById(doctorId);

        // Parse and format the date and time
        const formattedDate = moment(appointmentDate, 'DD MMM, YYYY').format('DD MMM, YYYY');
        const formattedTime = moment(appointmentTime, 'hh:mm:ss A').format('hh:mm:ss A');

        const previousAppointment = await appointments.findOne({ doctorId, appointmentDate: formattedDate, appointmentTime: formattedTime });

        if (previousAppointment) {
            return res.status(400).json({ message: 'Appointment already exists' });
        }

        const newAppointment = new appointments({
            patientId,
            doctorId,
            doctorName: doctorName.name,
            patientName: patientName.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            purpose,
            doctorApproval: true,
            notes
        });
        await newAppointment.save();
        return res.status(201).json({ message: 'Appointment created', appointment: newAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
const createAppointmentPatient = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctorId, appointmentDate, appointmentTime, purpose, notes } = req.body;
        const assignToDoctor = await doctorPatientAssignments.findOne({ patientId, doctorId });

        if (!assignToDoctor) {
            return res.status(400).json({ message: 'Doctor not assigned to patient' });
        }
        const patientName = await patients.findById(patientId);
        const doctorName = await doctors.findById(doctorId);

        // Parse and format the date and time
        const formattedDate = moment(appointmentDate, 'DD MMM, YYYY').format('DD MMM, YYYY');
        const formattedTime = moment(appointmentTime, 'hh:mm:ss A').format('hh:mm:ss A');

        const previousAppointment = await appointments.findOne({ patientId, appointmentDate: formattedDate, appointmentTime: formattedTime });

        if (previousAppointment) {
            return res.status(400).json({ message: 'Appointment already exists' });
        }

        const newAppointment = new appointments({
            patientId,
            doctorId,
            doctorName: doctorName.name,
            patientName: patientName.name,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            purpose,
            patientApproval: true,
            notes
        });
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
        console.log(appointmentsList);
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
        console.log(patientId);
        console.log(appointmentsList);
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
        
        const { purpose, notes,status, doctorApproval, appointmentId } = req.body;
        console.log(req.body);
        const appointment = await appointments.findByIdAndUpdate(appointmentId,{$set: 
            { purpose, notes,status, doctorApproval }
        }, { new: true });
       
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
       if (status === 'cancelled') {
            await appointments.findByIdAndDelete(appointmentId);
            return res.status(200).json({ message: 'Appointment cancelled' });
        }
       
        return res.status(200).json({ message: 'Appointment updated', appointment: appointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const editAppointmentPatient = async (req, res) => {
    try {
        
        const { status, patientApproval, appointmentId } = req.body;
        console.log(req.body);
        const appointment = await appointments.findByIdAndUpdate(appointmentId,{$set: 
            { status, patientApproval }
        }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (status === 'cancelled') {
            await appointments.findByIdAndDelete(appointmentId);
            return res.status(200).json({ message: 'Appointment cancelled' });
        }
        return res.status(200).json({ message: 'Appointment updated', appointment: appointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const specificDateAppointmentsDoctor = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const {date} = req.query;
        
        const appointmentsList = await appointments.find({ doctorId,appointmentDate:date }).select('appointmentTime');
        if (!appointmentsList) {
            return res.status(200).json({ message: 'No appointments found on that date' });
        }
        return res.status(200).json({ appointments: appointmentsList });
    } catch (error) {
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const specificDateAppointmentsPatient = async (req, res) => {
    try {
        const patientId = req.user.id;
        const {date} = req.query;
        
        const appointmentsList = await appointments.find({ patientId,appointmentDate:date }).select('appointmentTime');
        if (!appointmentsList) {
            return res.status(200).json({ message: 'No appointments found on that date' });
        }
        return res.status(200).json({ appointments: appointmentsList });
    } catch (error) {
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { createAppointment, getDoctorAppointments, getPatientAppointments, editAppointment, createAppointmentPatient, editAppointmentPatient, specificDateAppointmentsDoctor, specificDateAppointmentsPatient };