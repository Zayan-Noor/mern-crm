import Deal from '../models/Deal.js';

export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate('contact', 'name email company')
      .sort({ updatedAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const createDeal = async (req, res) => {
  try {
    const { title, value, stage, contact, expectedCloseDate } = req.body;
    if (!title || value === undefined || !contact) {
      return res.status(400).json({ message: 'Title, value, and contact are required' });
    }
    const deal = await Deal.create({
      title,
      value: Number(value),
      stage: stage || 'new',
      contact,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
    });
    await deal.populate('contact', 'name email company');
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const allowed = ['title', 'value', 'stage', 'contact', 'expectedCloseDate'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'value') updates[key] = Number(req.body[key]);
        else if (key === 'expectedCloseDate')
          updates[key] = req.body[key] ? new Date(req.body[key]) : null;
        else updates[key] = req.body[key];
      }
    }
    const deal = await Deal.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('contact', 'name email company');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal removed' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
