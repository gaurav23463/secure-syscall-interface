const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const SyscallLog = require('../models/SyscallLog');

const router = express.Router();

router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const logs = await SyscallLog.find()
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ logs });
  } catch (error) {
    console.error('Fetch logs failed', error);
    res.status(500).json({ message: 'Unable to retrieve audit logs.' });
  }
});

module.exports = router;
