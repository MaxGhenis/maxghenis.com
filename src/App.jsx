import React from "react";
import {
  Github,
  LinkedinIcon,
  Globe,
  MessageSquare,
  Book,
  Mail,
} from "lucide-react";

// Custom X icon since Lucide doesn't have the new X logo
const XIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    {...props}
  >
    <path d="M16.99 2L12.62 7.95 8.24 2H2.8L9.12 10.87L1.56 22H7L11.38 16.05L15.76 22H21.2L14.88 13.13L22.44 2H16.99Z" />
  </svg>
);

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    className="text-gray-600 hover:text-gray-900 transition-colors"
    aria-label={label}
  >
    <Icon className="w-6 h-6" />
  </a>
);

const Section = ({ title, children, className = "" }) => (
  <section className={`mb-12 ${className}`}>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
    {children}
  </section>
);

const OrganizationTile = ({
  logo,
  title,
  href,
  description,
  links = [],
  className = "",
}) => (
  <div
    className={`bg-gray-50 p-8 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
  >
    <a href={href} className="block">
      <img src={logo} alt={`${title} Logo`} className="h-12 w-auto mb-6" />
      <p className="text-gray-700 mb-4">{description}</p>
      {links.length > 0 && (
        <div className="flex gap-4 text-sm text-gray-600">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {link.text}
            </a>
          ))}
        </div>
      )}
    </a>
  </div>
);

const ProjectTile = ({ title, href, description }) => (
  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
    <a href={href} className="block">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </a>
  </div>
);

const App = () => {
  const socialLinks = [
    { href: "mailto:mghenis@gmail.com", icon: Mail, label: "Email" },
    {
      href: "https://x.com/maxghenis",
      icon: XIcon,
      label: "X (formerly Twitter)",
    },
    {
      href: "https://linkedin.com/in/maxghenis",
      icon: LinkedinIcon,
      label: "LinkedIn",
    },
    { href: "https://github.com/maxghenis", icon: Github, label: "GitHub" },
    {
      href: "https://maxghenis.substack.com/",
      icon: MessageSquare,
      label: "Substack",
    },
    { href: "https://medium.com/@maxghenis", icon: Book, label: "Medium" },
    {
      href: "https://bsky.app/profile/maxghenis.bsky.social",
      icon: Globe,
      label: "Bluesky",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-48 h-48 rounded-full overflow-hidden border border-gray-200">
              <img
                src="images/headshot.png"
                alt="Max Ghenis"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Max Ghenis
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Economist, Policy Entrepreneur, and Data Scientist
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                {socialLinks.map((link) => (
                  <SocialLink key={link.href} {...link} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Section title="Current work">
          <OrganizationTile
            logo="https://raw.githubusercontent.com/PolicyEngine/policyengine-app/master/src/images/logos/policyengine/blue.png"
            title="PolicyEngine"
            href="https://policyengine.org"
            description="As co-founder and CEO of PolicyEngine, I lead the development of open source software to simulate economic policies in the US and UK. Our nonprofit's tools help policymakers, researchers, and the public understand how tax and benefit reforms affect society."
            links={[]}
            className="mb-6"
          />
        </Section>

        <Section title="Previous work">
          <div className="space-y-6">
            <OrganizationTile
              logo="https://raw.githubusercontent.com/UBICenter/ubicenter.org/master/assets/images/logos/wide-blue.jpg"
              title="UBI Center"
              href="https://ubicenter.org"
              description="Founded and served as president of the UBI Center, a think tank researching universal basic income policies."
            />
            <OrganizationTile
              logo="https://lh3.googleusercontent.com/d_S5gxu_S1P6NR1gXeMthZeBzkrQMHdI5uvXrpn3nfJuXpCjlqhLQKH_hbOxTHxFhp5WugVOEcl4WDrv9rmKBDOMExhKU5KmmLFQVg"
              title="Google"
              href="https://google.com"
              description="Worked as a data scientist, leading projects to make internal operations and products more inclusive across the world."
            />
          </div>
        </Section>

        <Section title="Side projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProjectTile
              title="CodeStitch"
              href="https://codestitch.dev"
              description="A React app that combines GitHub repos, PRs, and issues into single files for AI context"
            />
            <ProjectTile
              title="PR Improver"
              href="https://pr-improver.streamlit.app"
              description="An LLM-powered tool suggesting improvements to PRs based on repo guidelines"
            />
            <ProjectTile
              title="OEWS Explorer"
              href="https://oews-explorer.streamlit.app"
              description="A dashboard for exploring BLS occupational & wage data"
            />
            <ProjectTile
              title="HiveSight"
              href="https://hivesight.ai"
              description="A tool for surveying LLMs that assume diverse personas (in development)"
            />
          </div>
        </Section>

        <Section title="Academic research">
          <div className="space-y-6">
            <a
              href="https://github.com/MaxGhenis/llm-presidential-outcome-forecasts/blob/main/paper/main.pdf"
              className="block bg-gray-50 p-6 rounded-lg hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2">
                AI Model Policy Impact Forecasts: A Narrative Prompting Approach
              </h3>
              <p className="text-gray-600">
                Examining LLMs for forecasting policy outcomes under different
                U.S. presidential administrations.
              </p>
            </a>
            <a
              href="https://github.com/PolicyEngine/policyengine-us-data/blob/main/paper/main.pdf"
              className="block bg-gray-50 p-6 rounded-lg hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2">
                Enhancing Survey Microdata with Administrative Records
              </h3>
              <p className="text-gray-600">
                A novel approach to microsimulation dataset construction,
                combining CPS and IRS data. Presented at the National Tax
                Association meeting (December 2024).
              </p>
            </a>
          </div>
        </Section>

        <Section title="Featured articles">
          <div className="space-y-4">
            {[
              {
                title:
                  "The American Rescue Plan was a step toward universal basic income",
                source: "The Hill",
                href: "https://thehill.com/opinion/finance/552333-the-american-rescue-plan-was-a-step-toward-universal-basic-income/",
              },
              {
                title:
                  "Would basic income be better than additional unemployment benefits?",
                source: "The Hill",
                href: "https://thehill.com/opinion/finance/514672-would-basic-income-be-better-than-additional-unemployment-benefits/",
              },
              {
                title: "Democrats should be courting Romney, not Manchin",
                source: "The Hill",
                href: "https://thehill.com/opinion/white-house/587590-democrats-should-be-courting-romney-not-manchin/",
              },
            ].map((article) => (
              <a
                key={article.href}
                href={article.href}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="text-gray-600">{article.source}</p>
              </a>
            ))}
          </div>
        </Section>

        <Section title="Education">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                M.S., Data, Economics, and Development Policy
              </h3>
              <p className="text-gray-600">MIT, 2020</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                B.A., Operations Research and Management Science
              </h3>
              <p className="text-gray-600">UC Berkeley, 2008</p>
              <p className="text-gray-600">
                Minors: Industrial Engineering & Operations Research, Music
              </p>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
};

export default App;
