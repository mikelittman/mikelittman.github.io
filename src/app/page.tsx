import Image from "next/image";
import { DayNightToggle } from "@/components/dayNightToggle";
import { YearDuration } from "@/components/yearDuration";
import { VoronoiBackground } from "@/components/voronoiBackground";
import { GitHub } from "@/icons/github";
import { LinkedIn } from "@/icons/linkedin";

const focusAreas = [
  {
    title: "OpenAI Platform",
    summary:
      "Production integrations with chat, tool-calling, multimodal workflows, and evaluation loops.",
  },
  {
    title: "Anthropic Models",
    summary:
      "Claude-based assistants for long-context synthesis, workflow automation, and coding copilots.",
  },
  {
    title: "MCP Tooling",
    summary:
      "MCP server design and orchestration that gives AI agents reliable, auditable access to real systems.",
  },
];

const capabilities = [
  "Agentic workflows and tool routing",
  "Prompt and retrieval architecture",
  "Typed API integrations in TypeScript and Python",
  "Evaluation harnesses and regression checks",
  "Safe deployment patterns for production assistants",
  "Data and UX layers that make AI features usable",
];

const stack = [
  "OpenAI API",
  "Anthropic API",
  "MCP Servers",
  "TypeScript",
  "Python",
  "Next.js",
  "Node.js",
  "Docker",
  "AWS",
];

export default function Page() {
  return (
    <main className="site-shell">
      <VoronoiBackground />

      <div className="noise-overlay" aria-hidden="true" />

      <div className="content">
        <header className="hero">
          <div className="hero-top-row">
            <span className="status-pill">Software + AI Engineer</span>
            <span className="theme-control" title="Toggle theme">
              <DayNightToggle />
            </span>
          </div>

          <div className="identity">
            <div className="headshot-wrap">
              <Image
                src="/headshot.png"
                width={192}
                height={192}
                alt="Mike Littman headshot"
                priority
              />
            </div>

            <div>
              <h1>Mike Littman</h1>
              <p className="hero-text">
                Building production software and AI systems with OpenAI and Anthropic, plus robust tool integration through Model Context Protocol (MCP) servers.
              </p>
              <p className="hero-subtext">
                <YearDuration start="2015-01-01" /> shipping software across
                APIs, cloud platforms, distributed systems, and product-facing interfaces.
              </p>
            </div>
          </div>

          <div className="social-row">
            <a
              href="https://github.com/mikelittman"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <GitHub />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/littman-mike/"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <LinkedIn />
              <span>LinkedIn</span>
            </a>
          </div>
        </header>

        <section className="panel">
          <h2>Core AI Experience</h2>
          <div className="grid cards">
            {focusAreas.map((area) => (
              <article key={area.title} className="card">
                <h3>{area.title}</h3>
                <p>{area.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>What I Build</h2>
          <ul className="checklist">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Working Stack</h2>
          <div className="tag-cloud">
            {stack.map((item) => (
              <span key={item} className="tag">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
