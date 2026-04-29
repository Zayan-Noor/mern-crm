import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';

const CONTACT_STATUSES = ['lead', 'contacted', 'qualified', 'customer', 'lost'];
const DEAL_STAGES = ['new', 'contacted', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

export const getStats = async (req, res) => {
  try {
    const [totalContacts, contactAgg, dealsValueAgg, stageAgg, recentContacts] =
      await Promise.all([
        Contact.countDocuments(),
        Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Deal.aggregate([{ $group: { _id: null, total: { $sum: '$value' } } }]),
        Deal.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
        Contact.find()
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate('assignedTo', 'name email')
          .lean(),
      ]);

    const contactsByStatus = {};
    CONTACT_STATUSES.forEach((s) => {
      contactsByStatus[s] = 0;
    });
    contactAgg.forEach((row) => {
      if (row._id) contactsByStatus[row._id] = row.count;
    });

    const totalDealsValue = dealsValueAgg[0]?.total ?? 0;

    const dealsByStage = {};
    DEAL_STAGES.forEach((s) => {
      dealsByStage[s] = 0;
    });
    stageAgg.forEach((row) => {
      if (row._id) dealsByStage[row._id] = row.count;
    });

    res.json({
      totalContacts,
      contactsByStatus,
      totalDealsValue,
      dealsByStage,
      recentContacts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
