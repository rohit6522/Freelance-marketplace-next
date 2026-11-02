// Register form ke "Primary Domain Focus" options. Frontend ki list isi ke keys se match karti hai.
export const FOCUS_AREAS = {
  fullstack: {
    title: "Full-Stack Web Developer",
    skills: ["Next.js", "React", "Node.js", "TypeScript"],
  },
  "smart-contracts": {
    title: "Smart Contract and Web3 Engineer",
    skills: ["Solidity", "Rust", "Web3"],
  },
  "ui-ux": {
    title: "UI/UX and Product Designer",
    skills: ["Figma", "UX Research", "Prototyping", "Design Systems"],
  },
  "cloud-devops": {
    title: "Cloud and DevOps Engineer",
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD"],
  },
  "ai-ml": {
    title: "AI and Machine Learning Engineer",
    skills: ["Python", "LLM APIs", "RAG", "Vector Databases"],
  },
  security: {
    title: "Security and Smart Contract Auditor",
    skills: ["Penetration Testing", "Security Audits", "Smart Contracts"],
  },
};

export const FOCUS_KEYS = Object.keys(FOCUS_AREAS);