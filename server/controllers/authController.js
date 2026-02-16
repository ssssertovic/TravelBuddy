// controllers/authController.js
const User = require('../models/userModel');

const authController = {
  register: (req, res) => {
    const newUser = req.body;

    User.register(newUser, (err, createdUser) => {
      if (err) {
        return res.status(500).json({ message: 'Error registering user.' });
      }
      res.status(201).json(createdUser);
    });
  },

  login: (req, res) => {
    const { username, password } = req.body;

    User.login(username, password, (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in.' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Pogrešan username ili lozinka.' });
      }

      // Return a token or other authentication information
      return res.json({ user });
    });
  },
};

module.exports = authController;
