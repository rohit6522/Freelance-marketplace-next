// Backend ke validation errors me pehla detail message zyada kaam ka hota hai
export const errorText = (err) => err?.details?.[0]?.message || err?.message || "Something went wrong.";