// Jo error kisi field se match nahi hota, wo messages ki list me wapas aata hai
export function applyApiErrors(err, setError, fieldMap = {}) {
  const leftovers = [];
  const details = Array.isArray(err?.details) ? err.details : [];

  for (const { field, message } of details) {
    const target = fieldMap[field];
    if (target) setError(target, { type: "server", message });
    else leftovers.push(message);
  }

  if (!details.length) leftovers.push(err?.message || "Something went wrong. Please try again.");
  return leftovers;
}