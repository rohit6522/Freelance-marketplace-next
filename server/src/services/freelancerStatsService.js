import mongoose from "mongoose";
import Order from "../models/Order.js";

const isDate = (field) => ({ $eq: [{ $type: field }, "date"] });

export const getFreelancerStats = async (freelancerId) => {
  const [row] = await Order.aggregate([
    { $match: { freelancer: new mongoose.Types.ObjectId(freelancerId) } },
    {
      $group: {
        _id: null,
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
        earned: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] } },
        delivered: { $sum: { $cond: [isDate("$deliveredAt"), 1, 0] } },
        onTime: {
          $sum: {
            $cond: [
              { $and: [isDate("$deliveredAt"), isDate("$dueDate"), { $lte: ["$deliveredAt", "$dueDate"] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const completed = row?.completed || 0;
  const cancelled = row?.cancelled || 0;
  const delivered = row?.delivered || 0;
  const onTime = row?.onTime || 0;

  const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : null);

  return {
    completedOrders: completed,
    cancelledOrders: cancelled,
    jobSuccessRate: percent(completed, completed + cancelled), // null = abhi data nahi
    onTimeDeliveryRate: percent(onTime, delivered),
    totalEarned: row?.earned || 0,
  };
};