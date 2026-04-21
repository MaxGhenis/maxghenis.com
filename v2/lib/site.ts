export const SITE = {
  name: "Max Ghenis",
  tagline: "Building democratic infrastructure for simulating society.",
  sections: [
    { slug: "models", title: "Models", blurb: "Microsimulations, papers, and live calculators." },
    { slug: "tools", title: "Tools", blurb: "Infrastructure for working with agents and code." },
    { slug: "writing", title: "Writing", blurb: "Essays, notes, and the Society in Silico book." },
    { slug: "data", title: "Data", blurb: "Personal and applied open datasets." },
  ],
  social: {
    github: "https://github.com/maxghenis",
    twitter: "https://x.com/maxghenis",
    linkedin: "https://linkedin.com/in/maxghenis",
    bluesky: "https://bsky.app/profile/maxghenis.bsky.social",
    email: "max@policyengine.org",
  },
} as const;
