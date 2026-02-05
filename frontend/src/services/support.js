/**
 * Support API Service
 * @see swagger.js: GET /support/tickets, POST /support/tickets (subject, message, priority)
 */
import { apiClient } from "./apiClient";
import { uploadImage } from "./uploads";

const TICKETS = "/support/tickets";

/**
 * Get all support tickets
 * GET /support/tickets
 * @returns {Promise<Array>} - Array of SupportTicket
 */
export const getSupportTickets = async () => {
  const response = await apiClient.get(TICKETS);
  return response.data?.data ?? response.data ?? [];
};

/**
 * Create a new support ticket
 * POST /support/tickets (body: subject, message, priority)
 * @param {Object} ticketData
 * @param {string} ticketData.subject - Subject
 * @param {string} ticketData.message - Message
 * @param {string} [ticketData.priority] - Priority (e.g. low, medium, high)
 * @param {string} [ticketData.category] - Optional category
 * @param {File} [ticketData.file] - Optional attachment (uploaded via /uploads/upload-images)
 * @returns {Promise<object>} - Created ticket
 */
export const createSupportTicket = async (ticketData) => {
  let attachmentUrl = null;
  if (ticketData.file) {
    try {
      attachmentUrl = await uploadImage(ticketData.file);
    } catch (err) {
      console.error("Failed to upload attachment:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null);
      throw new Error(
        msg
          ? `Upload failed: ${msg}`
          : "Failed to upload attachment. Please try again."
      );
    }
  }
  const payload = {
    subject: ticketData.subject,
    message: ticketData.message,
    priority: ticketData.priority || "medium",
    ...(ticketData.category && { category: ticketData.category }),
    ...(attachmentUrl && { attachment_url: attachmentUrl }),
  };
  const response = await apiClient.post(TICKETS, payload);
  return response.data?.data ?? response.data;
};

/**
 * Get a specific support ticket by ID
 * @param {string} ticketId - Ticket ID
 * @returns {Promise} - Ticket data
 */
export const getSupportTicket = async (ticketId) => {
  const response = await apiClient.get(`/support/tickets/${ticketId}`);
  return response.data?.data ?? response.data;
};

/**
 * Update ticket status
 * @param {string} ticketId - Ticket ID
 * @param {string} status - New status (e.g., "In Progress", "Resolved")
 * @returns {Promise} - Updated ticket data
 */
export const updateTicketStatus = async (ticketId, status) => {
  const response = await apiClient.patch(`/support/tickets/${ticketId}`, { status });
  return response.data?.data ?? response.data;
};
