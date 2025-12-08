export const generateBookingId = (): string => {
  const prefix = "BK"; // customize if needed
  const timestamp = Date.now(); // milliseconds
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${prefix}-${timestamp}-${random}`;
};
