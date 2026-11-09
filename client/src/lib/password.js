export const validatePassword = (value = "") => {
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password cannot exceed 72 characters";
  if (!/[A-Za-z]/.test(value)) return "Password must contain at least one letter";
  if (!/\d/.test(value)) return "Password must contain at least one number";
  return true;
};

export function getPasswordStrength(value = "") {
  if (!value) return { level: 0, label: "None" };

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 10 && /[A-Z]/.test(value) && /[0-9]/.test(value)) score++;
  if (value.length >= 12 && /[^A-Za-z0-9]/.test(value)) score++;

  if (score === 1 || value.length < 8) return { level: 1, label: "Fair" };
  if (score === 2) return { level: 2, label: "Strong" };
  return { level: 3, label: "Enterprise Grade" };
}