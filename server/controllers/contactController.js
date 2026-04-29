import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';

export const getContacts = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { email: rx }, { company: rx }];
    }
    const contacts = await Contact.find(query)
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email');
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const createContact = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.name) return res.status(400).json({ message: 'Name is required' });
    if (!payload.assignedTo) payload.assignedTo = req.user._id;
    const contact = await Contact.create(payload);
    await contact.populate('assignedTo', 'name email');
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateContact = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'company', 'status', 'assignedTo'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const contact = await Contact.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email');
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    await Deal.deleteMany({ contact: req.params.id });
    res.json({ message: 'Contact removed' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.notes.push({ text: text.trim(), createdBy: req.user._id });
    await contact.save();
    await contact.populate('assignedTo', 'name email');
    await contact.populate('notes.createdBy', 'name email');
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
