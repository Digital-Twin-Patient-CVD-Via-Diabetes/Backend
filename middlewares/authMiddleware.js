
import jwt from 'jsonwebtoken';

const authenticateUser = (userType) => {
  return (req, res, next) => {
    try {
      
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
      }

      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

     
      if (decoded.userType !== userType) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

const authenticatePatient = authenticateUser("patient");
const authenticateDoctor = authenticateUser("doctor");

export default {
  authenticatePatient,
  authenticateDoctor,
};

