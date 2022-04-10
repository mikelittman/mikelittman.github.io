import type { NextPage } from "next";
import Head from "next/head";
import { DayNightToggle } from "../components/dayNightToggle";
import { YearDuration } from "../components/yearDuration";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Mike Littman</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="author" content="Mike Littman" />
        <meta
          name="description"
          content="Mike Littman's personal website"
        />
        <meta
          name="keywords"
          content="mike, littman, personal, website"
        />
        <meta property="og:title" content="Mike Littman" />
        <meta
          property="og:site_name"
          content="Mike Littman"
        />
        <meta
          property="og:description"
          content="Developer of software"
        />
        <meta
          property="og:url"
          content="https://mikelittman.me"
        />
      </Head>
      <section>
        <h1>
          Mike Littman <DayNightToggle></DayNightToggle>
        </h1>
        <p>
          Software Developer with{" "}
          <YearDuration start="2015-01-01"></YearDuration>{" "}
          of experience
        </p>
      </section>
      <section>
        <h3>Topics of interest:</h3>
        <ul>
          <li>Distributed Systems</li>
          <li>Microservices</li>
          <li>Mobile Development</li>
          <li>VR/AR</li>
        </ul>
      </section>

      <section>
        <h3>Frequently used technologies:</h3>
        <dl>
          <dt>Languages</dt>
          <dd>TypeScript</dd>
          <dd>Java</dd>

          <dt>Tools</dt>
          <dd>Git</dd>
          <dd>Docker</dd>

          <dt>Service Providers</dt>
          <dd>AWS</dd>
          <dd>DigitalOcean</dd>
        </dl>
      </section>

      <footer>
        <div className="socials">
          <a
            href="https://github.com/mikelittman"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/GitHub-Mark-Black.svg"
              className="dark-invert"
              alt="GitHub logo"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/littman-mike/"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/LI-In-Bug.png" alt="LinkedIn logo" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;