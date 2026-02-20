const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// In-memory data store (replace with DynamoDB in production)
let appointments = [
  { id: '1', patientId: '1', date: '2025-02-25', time: '10:00', doctor: 'Dr. Smith' },
  { id: '2', patientId: '2', date: '2025-02-26', time: '14:00', doctor: 'Dr. Jones' }
];

// Root redirects to health
app.get('/', (req, res) => res.redirect('/health'));

// Health and API routes (prefix /appointments for API Gateway consistency)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Appointment Service' });
});
app.get('/appointments/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Appointment Service' });
});

app.get('/appointments', (req, res) => {
  res.json({
    message: 'Appointments retrieved successfully',
    count: appointments.length,
    appointments: appointments
  });
});

app.get('/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === req.params.id);
  if (appointment) {
    res.json({
      message: 'Appointment found',
      appointment: appointment
    });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

app.get('/appointments/patient/:patientId', (req, res) => {
  const patientAppointments = appointments.filter(a => a.patientId === req.params.patientId);
  if (patientAppointments.length > 0) {
    res.json({
      message: 'Patient appointments retrieved',
      count: patientAppointments.length,
      appointments: patientAppointments
    });
  } else {
    res.status(404).json({ error: 'No appointments found for this patient' });
  }
});

app.post('/appointments', (req, res) => {
  try {
    const { patientId, date, time, doctor } = req.body;
    if (!patientId || !date || !time || !doctor) {
      return res.status(400).json({
        error: 'patientId, date, time, and doctor are required'
      });
    }
    const newAppointment = {
      id: (appointments.length + 1).toString(),
      patientId,
      date,
      time,
      doctor
    };
    appointments.push(newAppointment);
    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment: newAppointment
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Appointment service listening at http://0.0.0.0:${port}`);
});
