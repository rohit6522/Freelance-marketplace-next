const DEMO_HOSTS = ["https://picsum.photos/", "https://fastly.picsum.photos/"];

export const isAllowedMediaUrl = (url) => {
  if (typeof url !== "string") return false;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloud && url.startsWith(`https://res.cloudinary.com/${cloud}/`)) return true;

  if (process.env.NODE_ENV === "production") return false;
  if (!cloud) return /^https?:\/\/\S+$/.test(url); // Cloudinary abhi set nahi hua (dev)
  return DEMO_HOSTS.some((host) => url.startsWith(host));
};