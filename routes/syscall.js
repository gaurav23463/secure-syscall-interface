const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const SyscallLog = require('../models/SyscallLog');

const router = express.Router();
const STORAGE_DIR = path.join(__dirname, '..', 'storage');

const sanitizeFileName = (name) => {
  return typeof name === 'string' && /^[a-zA-Z0-9._-]+$/.test(name) && !name.includes('..');
};

const logSystemCall = async ({ userId, action, resource, outcome, details }) => {
  try {
    await SyscallLog.create({
      user: userId,
      action,
      resource,
      outcome,
      details,
    });
  } catch (error) {
    console.error('Log creation failed', error);
  }
};

router.get('/files', auth, async (req, res) => {
  try {
    const files = fs.readdirSync(STORAGE_DIR).filter((file) => file !== '.gitkeep');
    await logSystemCall({
      userId: req.user._id,
      action: 'list-files',
      resource: 'storage',
      outcome: 'success',
      details: `Listed ${files.length} files`,
    });
    res.json({ files });
  } catch (error) {
    console.error('List files error', error);
    await logSystemCall({
      userId: req.user._id,
      action: 'list-files',
      resource: 'storage',
      outcome: 'failure',
      details: error.message,
    });
    res.status(500).json({ message: 'Unable to list files' });
  }
});

router.post('/read', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!sanitizeFileName(name)) {
      return res.status(400).json({ message: 'Invalid file name.' });
    }

    const filePath = path.join(STORAGE_DIR, name);
    if (!fs.existsSync(filePath)) {
      await logSystemCall({
        userId: req.user._id,
        action: 'read-file',
        resource: name,
        outcome: 'failure',
        details: 'File not found',
      });
      return res.status(404).json({ message: 'File not found.' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    await logSystemCall({
      userId: req.user._id,
      action: 'read-file',
      resource: name,
      outcome: 'success',
      details: 'File read successfully',
    });
    res.json({ name, content });
  } catch (error) {
    console.error('Read file error', error);
    await logSystemCall({
      userId: req.user._id,
      action: 'read-file',
      resource: req.body.name || 'unknown',
      outcome: 'failure',
      details: error.message,
    });
    res.status(500).json({ message: 'Unable to read file.' });
  }
});

router.post('/write', auth, async (req, res) => {
  try {
    const { name, content } = req.body;
    if (!sanitizeFileName(name) || typeof content !== 'string') {
      return res.status(400).json({ message: 'Invalid file name or content.' });
    }

    const filePath = path.join(STORAGE_DIR, name);
    fs.writeFileSync(filePath, content, 'utf8');
    await logSystemCall({
      userId: req.user._id,
      action: 'write-file',
      resource: name,
      outcome: 'success',
      details: `Wrote ${content.length} bytes`,
    });
    res.json({ message: 'File saved successfully.', name });
  } catch (error) {
    console.error('Write file error', error);
    await logSystemCall({
      userId: req.user._id,
      action: 'write-file',
      resource: req.body.name || 'unknown',
      outcome: 'failure',
      details: error.message,
    });
    res.status(500).json({ message: 'Unable to save file.' });
  }
});

router.delete('/delete', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!sanitizeFileName(name)) {
      return res.status(400).json({ message: 'Invalid file name.' });
    }

    const filePath = path.join(STORAGE_DIR, name);
    if (!fs.existsSync(filePath)) {
      await logSystemCall({
        userId: req.user._id,
        action: 'delete-file',
        resource: name,
        outcome: 'failure',
        details: 'File not found',
      });
      return res.status(404).json({ message: 'File not found.' });
    }

    fs.unlinkSync(filePath);
    await logSystemCall({
      userId: req.user._id,
      action: 'delete-file',
      resource: name,
      outcome: 'success',
      details: 'File deleted',
    });
    res.json({ message: 'File deleted successfully.', name });
  } catch (error) {
    console.error('Delete file error', error);
    await logSystemCall({
      userId: req.user._id,
      action: 'delete-file',
      resource: req.body.name || 'unknown',
      outcome: 'failure',
      details: error.message,
    });
    res.status(500).json({ message: 'Unable to delete file.' });
  }
});

module.exports = router;
