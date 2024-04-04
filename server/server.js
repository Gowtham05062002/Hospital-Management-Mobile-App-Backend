const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const router = express.Router();
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3000;
const secretKey = 'my_super_secret_key_123';
console.log('Generated secret key:', secretKey);

mongoose.connect('mongodb+srv://gowtham:Aw98AD4spZjKnt8N@cluster0.0lmcrpo.mongodb.net/Hospitalapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Admin schema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  mobileNumber: String,
  role: String,
});

const Admin = mongoose.model('Admin', adminSchema);

// Define schema for test requests
const testRequestSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'Collected', 'rejected'],
    default: 'pending',
  },
});
const bookingSchema = new mongoose.Schema({
  bookingId: String,
  userEmail: String,
  userName: String,
  appointmentTitle: String,
  selectedDistrict: String,
  selectedHospital: String,
  selectedDate: Date,
  selectedTimeSlot: String,
  selectedSlots: [String],
  totalCost: Number
});

const Booking = mongoose.model('Booking', bookingSchema);
const appointmentRequestSchema = new mongoose.Schema({
  name: String,
  doctor: String,
  userEmail: String,
  department: String,
  description: String,
  timeSlot: Date,
  reason: String,
  mobileNumber: String,
  status: { type: String, default: 'pending' } // Initial status is 'pending'
});

const AppointmentRequest = mongoose.model('AppointmentRequest', appointmentRequestSchema);

// Create model for test requests
const TestRequest = mongoose.model('TestRequest', testRequestSchema);
// Define Attendance schema
const attendanceSchema = new mongoose.Schema({
  staffId: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  timestamp: { type: Date, default: Date.now },
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// User schema
const userSchema = new mongoose.Schema({
  name:String,  
  email: String,
  password: String,
  department: String,
  userType: String,
  mobileNumber: String,
  staffId: String,
});

const User = mongoose.model('User', userSchema);


// Patient schema
const patientSchema = new mongoose.Schema({
  name:String,
  email: String,
  password: String,
  department: String,
  room:String,
  medicine:String,
  health:String,
  mobileNumber: String,
});

const Patient = mongoose.model('Patient', patientSchema);

//Meeting schema 

// MongoDB schema for meetings
const meetingSchema = new mongoose.Schema({
  meetingAssigner: String,
  title: String,
  description: String,
  date: Date,
  time: Date,
});

const Meeting = mongoose.model('Meeting', meetingSchema);

//prescribe route 
const prescriptionSchema = new mongoose.Schema({
  patientHistory: String,
  diagnosis: String,
  prescription: String,
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

// Room model
// Room schema
const roomSchema = new mongoose.Schema({
  roomNumber: String,
  status: { type: String, default: 'Vacant' },
});

const Room = mongoose.model('Room', roomSchema);



// Define LeaveRequest schema
const leaveRequestSchema = new mongoose.Schema({
  userEmail: String,
  department: String,
  description: String,
  date: Date,
  reason: String,
  status: { type: String, default: 'pending' } // Initial status is 'pending'
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

app.use(cors());
app.use(bodyParser.json());

// Handle appointment booking
// app.post('/bookAppointment', async (req, res) => {
//   try {
//     const { doctor, timeSlot, patientName, patientContact } = req.body;

//     const newAppointment = new Appointment({
//       doctor,
//       timeSlot,
//       patientName,
//       patientContact,
//     });

//     const savedAppointment = await newAppointment.save();
//     res.json(savedAppointment);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });




// POST route to create a leave request
app.post('/leave-request', async (req, res) => {
  try {
    const { userEmail, department, description, date, reason } = req.body;
    const leaveRequest = new LeaveRequest({ userEmail, department, description, date, reason });
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Error creating leave request:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET route to fetch all leave requests
app.get('/leave-requests', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find();
    res.json({ leaveRequests });
  } catch (error) {
    console.error('Error fetching leave requests:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PATCH route to update the status of a leave request
app.patch('/leave-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await LeaveRequest.findByIdAndUpdate(id, { status });
    res.json({ message: 'Leave request status updated successfully' });
  } catch (error) {
    console.error('Error updating leave request status:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Appointment Request 

app.post('/appointment', async (req, res) => {
  try {
    const {
      bookingId,
      userEmail,
      userName,
      appointmentTitle,
      selectedDistrict,
      selectedHospital,
      selectedDate,
      selectedTimeSlot,
      selectedSlots,
      totalCost,
    } = req.body;

    // Create a new Booking document using the Booking model
    const booking = new Booking({
      bookingId,
      userEmail,
      userName,
      appointmentTitle,
      selectedDistrict,
      selectedHospital,
      selectedDate,
      selectedTimeSlot,
      selectedSlots,
      totalCost,
    });

    // Save the booking document to the database
    await booking.save();

    // Respond with a success message
    res.status(201).json({ message: 'Booking data stored successfully' });
  } catch (error) {
    console.error('Error storing booking data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET route to fetch all booking details
app.get('/appointment', async (req, res) => {
  try {
    // Fetch all booking details from the database
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching booking details:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// POST route to create a new appointment request
app.post('/appointment-request', async (req, res) => {
  try {
    const { userEmail, department,name, doctor,mobileNumber, description, dateTime, reason } = req.body;
    const appointmentRequest = new AppointmentRequest({ userEmail, department, name, doctor, mobileNumber,description, dateTime, reason });
    await appointmentRequest.save();
    res.status(201).json({ message: 'Appointment request submitted successfully' });
  } catch (error) {
    console.error('Error creating appointment request:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET route to fetch all appointment requests
app.get('/appointment-requests', async (req, res) => {
  try {
    const appointmentRequests = await AppointmentRequest.find();
    res.json({ appointmentRequests });
  } catch (error) {
    console.error('Error fetching appointment requests:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PATCH route to update the status of an appointment request
app.patch('/appointment-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await AppointmentRequest.findByIdAndUpdate(id, { status });
    res.json({ message: 'Appointment request status updated successfully' });
  } catch (error) {
    console.error('Error updating appointment request status:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//testrequest route

// POST route to create a test request
app.post('/test-request', async (req, res) => {
  try {
    const { userEmail, department, description, date, reason } = req.body;
    const testRequest = new TestRequest({ userEmail, department,doctor, description, date, reason });
    await testRequest.save();
    res.status(201).json({ message: 'Test request submitted successfully' });
  } catch (error) {
    console.error('Error creating test request:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET route to fetch all test requests
app.get('/test-requests', async (req, res) => {
  try {
    const testRequests = await TestRequest.find();
    res.json({ testRequests });
  } catch (error) {
    console.error('Error fetching test requests:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PATCH route to update the status of a test request
app.patch('/test-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await TestRequest.findByIdAndUpdate(id, { status });
    res.json({ message: 'Test request status updated successfully' });
  } catch (error) {
    console.error('Error updating test request status:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//attendance route

app.post('/attendance/mark', async (req, res) => {
  const { staffId, status, timestamp } = req.body;

  try {
    // Record attendance in the database
    const attendanceRecord = new Attendance({
      staffId,
      status,
      timestamp: new Date(timestamp),
    });
    await attendanceRecord.save();

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Attendance marking error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Handle confirmation and generate token number
app.post('/confirmBooking', async (req, res) => {
  try {
    const { doctor, timeSlot, patientName, patientContact } = req.body;

    // Generate a random number between 1 and 5 for the token
    const tokenNumber = Math.floor(Math.random() * 5) + 1;

    const newAppointment = new Appointment({
      doctor,
      timeSlot,
      patientName,
      patientContact,
      tokenNumber,
    });

    const savedAppointment = await newAppointment.save();
    res.json(savedAppointment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Register admin
app.post('/admin/register', async (req, res) => {
  try {
    const { username, password, name, mobileNumber } = req.body;

    // Check if the username already exists in the Admin collection
    if (await Admin.findOne({ username })) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save admin to "Admin" collection
    await Admin.create({
      username,
      password: hashedPassword,
      name,
      mobileNumber,
      role: 'admin',
    });

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login admin and generate JWT
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username in the Admin collection
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: admin.username, role: admin.role }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register other users and save to "User" collection
// Registration route with JWT authentication
// Register route
// app.post('/register', async (req, res) => {
//   const { email, password, department, userType, mobileNumber } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({
//       email,
//       password: hashedPassword,
//       department,
//       userType,
//       mobileNumber,
//     });
//     await user.save();

//     const token = jwt.sign({ userId: user._id, email }, secretKey); // Using 'user._id' and 'email'
//     res.json({ 
//       message: 'User registered successfully',
//       user: {
//         email:user.email,
//         department:user.department,
//         userType:user.userType, // Assuming room is not provided in the request
//         mobileNumber:user.mobileNumber
//       },
//       token 
//     });
//   } catch (error) {
//     console.error('Registration error:', error.message);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


///register 2 

app.post('/register', async (req, res) => {
  const { name, email, password, department, userType, mobileNumber, staffId } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with userType
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      department,
      userType, // Store userType in the database
      mobileNumber,
      staffId,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, email }, secretKey);

    // Send response with token and user data
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        userType: newUser.userType,
        mobileNumber: newUser.mobileNumber,
        staffId: newUser.staffId
      },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/register', async (req, res) => {
  try {
    // Retrieve all registered users from the database
    const users = await User.find();

    // If there are no users found, return a 404 status code with a message
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // If users are found, return them as a JSON response
    res.json(users);
  } catch (error) {
    // If an error occurs during the database operation, handle it here
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




//user profile

// app.post('/profile', async (req, res) => {
//   const { userId } = req.body;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Remove sensitive information like password before sending user data
//     const { password, ...userData } = user.toObject();

//     res.json(userData);
//   } catch (error) {
//     console.error('Error fetching user profile:', error.message);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });




//patient register

// Patient Registration
// app.post('/patient/register', async (req, res) => {
//   const { name, email, password, department, room, health, medicine, mobileNumber } = req.body;

//   // Hash the password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Create a new patient
//   const patient = new Patient({
//     name,
//     email,
//     password: hashedPassword,
//     department,
//     health,
//     medicine,
//     room,
//     mobileNumber,
//   });

//   try {
//     // Save the patient to the database
//     await patient.save();
//     res.json({ message: 'Patient Added successfully' });
//   } catch (error) {
//     console.error('Registration error:', error.message);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

app.post('/patient/register', async (req, res) => {
  const { name, email, password, department, room, health, medicine, mobileNumber } = req.body;

  try {
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = new Patient({
      name,
      email,
      password: hashedPassword,
      department,
      health,
      medicine,
      room,
      mobileNumber,
    });

    await patient.save();

    const token = jwt.sign({ userId: patient._id, email: patient.email }, secretKey);
    res.json({ 
      message: 'Patient registered successfully',
      user: {
        name: patient.name,
        email: patient.email,
        department: patient.department,
        room: patient.room,
        health: patient.health,
        medicine: patient.medicine,
        mobileNumber: patient.mobileNumber
      },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/patient/register', async (req, res) => {
  try {
    // Retrieve all patient registrations from the database
    const patients = await Patient.find();

    // If there are no patients found, return a 404 status code with a message
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: 'No patients found' });
    }

    // If patients are found, return them as a JSON response
    res.json(patients);
  } catch (error) {
    // If an error occurs during the database operation, handle it here
    console.error('Error fetching patients:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Backend route to update patient details
app.put('/patient/register/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, department, room, health, medicine, mobileNumber } = req.body;

  try {
    // Find the patient by ID and update their details
    const patient = await Patient.findByIdAndUpdate(
      id,
      { name, email, department, room, health, medicine, mobileNumber },
      { new: true } // Return the updated document
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient details updated successfully', patient });
  } catch (error) {
    console.error('Error updating patient details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//ProfileScreen

// Profile route to fetch user data based on JWT token
app.get('/patient/profile', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decodedToken = jwt.verify(token, secretKey);

    // Extract user ID from decoded token
    const userId = decodedToken.userId;

    // Retrieve user profile data
    const user = await Patient.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.json({ user });
  } catch (error) {
    console.error('Profile route error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Login route for Patient

// Login other users and generate JWT
// Patient Login
// app.get('/patient/login', async (req, res) => {
//   const { email, password } = req.body;

//   // Find patient by email in the Patient collection
//   const patient = await Patient.findOne({ email });

//   if (!patient) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   // Compare the provided password with the hashed password in the database
//   const isPasswordValid = await bcrypt.compare(password, patient.password);

//   if (!isPasswordValid) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   // Generate JWT token
//   const token = jwt.sign({ userId: patient._id, email: patient.email }, secretKey);
//   console.log(token)

//   res.json({ token });
// });


app.post('/patient/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await Patient.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



//search route 
app.get('/api/patientByName/:name', async (req, res) => {
  const patientName = req.params.name;

  try {
    // Find patient by name in the Patient collection
    const patient = await Patient.findOne({ name: patientName });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Return patient information
    res.json({
      name: patient.name,
      email: patient.email,
      mobileNumber: patient.mobileNumber,
      department: patient.department,
      health: patient.health,
      medicine: patient.medicine,
      room: patient.room,
      // Add more fields as needed
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// // Login other users and generate JWT
// app.post('/login', async (req, res) => {
//   const { userType, email, password } = req.body;

//   // Find user by email and userType in the User collection
//   const user = await User.findOne({ email, userType });

//   if (!user) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   // Generate JWT token
//   const token = jwt.sign({ userId: user._id, userType: user.userType }, secretKey);

//   res.json({ token });
// });


// Login route
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return 404 (Not Found) status code
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, return 401 (Unauthorized) status code
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    // Send response with token and user data
    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Assuming you have middleware to authenticate requests and retrieve user data from the token
// The middleware might look something like this:
// const authenticateToken = (req, res, next) => {
//   // Verify token and attach user data to req.user
//   // ...
//   next();
// };

// Profile route to fetch user data
// Route for fetching user profile
// Assuming you have already defined your middleware for authentication

// Define the decodeToken function
const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error('Token decoding failed');
  }
};



// Use the decodeToken function in your route
app.get('/user/profile', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Decode the token to extract user ID
    const decodedToken = decodeToken(token);

    // Extract user ID from decoded token
    const userId = decodedToken.userId;

    // Retrieve user profile data using the user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.json({ user });
  } catch (error) {
    console.error('Profile route error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




//patient fetch code 

// Define the route to fetch user details by name
app.get('/api/patient/:email', async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Use Mongoose to find the user by email
    const user = await User.findOne({ email: { $regex: new RegExp(email, 'i') } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assuming the user object has a 'departmentId' field referencing the department
    const departmentsCollection = mongoose.connection.db.collection('Departments');
    const department = await departmentsCollection.findOne({ _id: user.departmentId });

    const { password, ...userData } = user.toObject(); // Convert Mongoose document to plain JavaScript object
    return res.status(200).json({ ...userData, department: department.name });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



// // Middleware to verify JWT token
// function authenticateToken(req, res, next) {
//   const token = req.header('Authorization');

//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) return res.status(403).json({ message: 'Forbidden' });

//     req.user = user;
//     next();
//   });
// }




// Route to handle meeting form submission
app.post('/meeting', async (req, res) => {
  try {
    const { meetingAssigner, title, description, date, time } = req.body;

    const newMeeting = new Meeting({
      meetingAssigner,
      title,
      description,
      date,
      time,
    });

    await newMeeting.save();

    res.status(201).json({ message: 'Meeting created successfully!' });
  } catch (error) {
    console.error('Error creating meeting:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });

    req.user = user;
    next();
  });
}

// Example protected route for nurses
app.get('/nurse-main', authenticateToken, (req, res) => {
  if (req.user.userType !== 'nurse') {
    return res.sendStatus(403);
  }

  res.json({ message: 'Welcome to the nurse main screen' });
});

// Example protected route for doctors
app.get('/doctor-main', authenticateToken, (req, res) => {
  if (req.user.userType !== 'doctor') {
    return res.sendStatus(403);
  }

  res.json({ message: 'Welcome to the doctor main screen' });
});

// Example protected route for lab technicians
app.get('/lab-main', authenticateToken, (req, res) => {
  if (req.user.userType !== 'labtech') {
    return res.sendStatus(403);
  }

  res.json({ message: 'Welcome to the labtech main screen' });
});

app.get('/reception-main', authenticateToken, (req, res) => {
  if (req.user.userType !== 'receptionist') {
    return res.sendStatus(403);
  }

  res.json({ message: 'Welcome to the Receptionist main screen' });
});


//prescription

app.post('/prescription', authenticateToken, async (req, res) => {
  try {
    const { patientHistory, diagnosis, prescription } = req.body;

    // Create a new Prescription document
    const newPrescription = new Prescription({
      patientHistory,
      diagnosis,
      prescription,
    });

    // Save the prescription to the "Prescription" collection
    await newPrescription.save();

    res.status(201).json({ message: 'Prescription saved successfully!' });
  } catch (error) {
    console.error('Error saving prescription:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });

    req.user = user;
    next();
  });
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });

    req.user = user;
    next();
  });
}

// Backend route for fetching rooms
app.get('/api/rooms', async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});


// Add a new route to create rooms
app.post('/api/rooms', async (req, res) => {
  const { roomNumber, status } = req.body;

  try {
    const newRoom = new Room({ roomNumber, status });
    const savedRoom = await newRoom.save();
    res.json(savedRoom);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Book a room
app.put('/api/rooms/:id/book', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { status: 'Booked' },
      { new: true }
    );
    res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Release a booked room
app.put('/api/rooms/:id/release', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { status: 'Vacant' },
      { new: true }
    );
    res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/updateRoomStatus/:id', async (req, res) => {
  const { id } = req.params;
  const { newRoomStatus } = req.body;

  try {
    const patient = await Patient.findByIdAndUpdate(
      id,
      { room: newRoomStatus },
      { new: true } // Return the updated document
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ updatedRoomStatus: patient.room });
  } catch (error) {
    console.error('Error updating Room Status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

// app.post('/appointments', async (req, res) => {
//   try {
//     const { doctor, patientName, description, dateTime, mobileNumber } = req.body;

//     const newAppointment = new Appointment({
//       doctor,
//       patientName,
//       description,
//       dateTime,
//       mobileNumber,
//     });

//     const savedAppointment = await newAppointment.save();

//     res.json(savedAppointment);
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     res.status(500).json({ error: 'Error creating appointment' });
//   }
// });

// app.get('/appointments', async (req, res) => {
//   try {
//     const appointments = await Appointment.find();
//     res.json(appointments);
//   } catch (error) {
//     console.error('Error fetching appointments:', error);
//     res.status(500).json({ error: 'Error fetching appointments' });
//   }
// });


let scannedData = [];

// Endpoint to store scanner data
app.post('/store-scanner-data', (req, res) => {
  const { email, status } = req.body;
  scannedData.push({ email, status });
  res.json({ message: 'Scanner data stored successfully' });
});

// Endpoint to retrieve all scanner data
app.get('/get-scanner-data', (req, res) => {
  res.json(scannedData);
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
