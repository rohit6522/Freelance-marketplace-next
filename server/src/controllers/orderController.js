import asyncHandler from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { ORDER_STATUS } from "../utils/constants.js";
import * as orderService from "../services/orderService.js";

const send = (res, order, message, status = 200) =>
  res.status(status).json({
    success: true,
    message,
    data: { order: orderService.withProgress(order) },
  });

// POST /api/orders   (checkout, simulated payment)
export const createOrder = asyncHandler(async (req, res) => {
  // Sirf gigId, tier, requirements. Price ya status body se kabhi nahi lete.
  const input = pick(req.body, ["gigId", "tier", "requirements"]);
  const order = await orderService.createOrder(req.user, input);
  send(res, order, "Order placed. Simulated payment is held in demo escrow.", 201);
});

// GET /api/orders
export const listOrders = asyncHandler(async (req, res) => {
  const data = await orderService.listOrders(req.user, req.query);
  res.json({ success: true, data });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderDetails(req.params.id, req.user);
  res.json({ success: true, data });
});

// Status badalne wale endpoints ek hi factory se
const makeAction = ({ toStatus, message, allowedFrom, buildPayload = () => ({}) }) =>
  asyncHandler(async (req, res) => {
    const order = await orderService.changeStatus({
      orderId: req.params.id,
      user: req.user,
      toStatus,
      allowedFrom,
      payload: buildPayload(req),
    });
    send(res, order, message);
  });

export const acceptOrder = makeAction({
  toStatus: ORDER_STATUS.IN_PROGRESS,
  allowedFrom: [ORDER_STATUS.PENDING],
  message: "Order accepted. You can start working.",
  buildPayload: () => ({ note: "Order accepted" }),
});

export const rejectOrder = makeAction({
  toStatus: ORDER_STATUS.CANCELLED,
  allowedFrom: [ORDER_STATUS.PENDING],
  message: "Order rejected. The simulated payment was refunded.",
  buildPayload: (req) => ({ note: "Rejected by freelancer", reason: req.body.reason }),
});

export const cancelOrder = makeAction({
  toStatus: ORDER_STATUS.CANCELLED,
  message: "Order cancelled. Unreleased simulated funds were refunded.",
  buildPayload: (req) => ({ note: "Order cancelled", reason: req.body.reason }),
});

export const deliverOrder = makeAction({
  toStatus: ORDER_STATUS.DELIVERED,
  message: "Work delivered. Waiting for the client's review.",
  buildPayload: (req) => ({
    note: "Work delivered",
    message: req.body.message,
    files: (req.body.files || []).map((f) => pick(f, ["name", "url", "publicId", "size", "mimeType"])),
  }),
});

export const requestRevision = makeAction({
  toStatus: ORDER_STATUS.REVISION_REQUESTED,
  message: "Revision requested.",
  buildPayload: (req) => ({ note: "Revision requested", message: req.body.message }),
});

export const completeOrder = makeAction({
  toStatus: ORDER_STATUS.COMPLETED,
  message: "Order completed. Remaining simulated funds were released.",
  buildPayload: () => ({ note: "Order completed" }),
});

// PATCH /api/orders/:id/milestones/:milestoneId/complete
export const completeMilestone = asyncHandler(async (req, res) => {
  const order = await orderService.completeMilestone({
    orderId: req.params.id,
    milestoneId: req.params.milestoneId,
    user: req.user,
  });
  send(res, order, "Milestone marked as completed");
});

// PATCH /api/orders/:id/milestones/:milestoneId/release
export const releaseMilestone = asyncHandler(async (req, res) => {
  const order = await orderService.releaseMilestone({
    orderId: req.params.id,
    milestoneId: req.params.milestoneId,
    user: req.user,
  });
  send(res, order, "Milestone funds released (simulated)");
});