import Image from "next/image";
import { DayNightToggle } from "@/components/dayNightToggle";
import { YearDuration } from "@/components/yearDuration";
import { GitHub } from "@/icons/github";
import { LinkedIn } from "@/icons/linkedin";

export default function Page() {
  return <main>
    <section>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <Image
          src={"/headshot.png"}
          width={200}
          height={200}
          alt="Mike Littman Headshot"
        />
      </div>
      <h1>Mike Littman</h1>
      <p>
        Software Developer with{" "}
        <YearDuration start="2015-01-01"></YearDuration> of
        experience
      </p>
    </section>

    <section>
      <h3>Topics of interest:</h3>
      <ul>
        <li>IoT</li>
        <li>Financial Technologies</li>
        <li>Physical Security</li>
        <li>Distributed Systems</li>
        <li>Microservices</li>
        <li>Mobile Development</li>
      </ul>
    </section>

    <section>
      <h3>Frequently used technologies:</h3>
      <dl>
        <dt>Languages</dt>
        <dd>TypeScript</dd>
        <dd>Python</dd>
        <dd>Java</dd>
        <dd>C#</dd>
        <dd>C++</dd>

        <dt>Tools</dt>
        <dd>Git</dd>
        <dd>Docker</dd>
        <dd>Kubernetes</dd>

        <dt>Service Providers</dt>
        <dd>AWS</dd>
        <dd>DigitalOcean</dd>
        <dd>Azure</dd>
      </dl>
    </section>

    <footer>
      <div className="socials">
        <a
          href="https://github.com/mikelittman"
          target="_blank"
          rel="noreferrer"
        >
          <GitHub />
        </a>
        <a
          href="https://www.linkedin.com/in/littman-mike/"
          target="_blank"
          rel="noreferrer"
        >
          <LinkedIn />
        </a>
      </div>
      <hr />
      <DayNightToggle></DayNightToggle>
    </footer>
  </main>;
}
