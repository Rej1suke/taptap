import Image from "next/image";
import type { ReactElement } from "react";
import brandLogo from "@/public/nuwave.png";

const houseRules = [
  {
    number: "01",
    title: "Dining time limit",
    description: "2 hours per drink.",
  },
  {
    number: "02",
    title: "Minimum order",
    description: "1 drink per person. No outside food.",
  },
  {
    number: "03",
    title: "Seats and tables",
    description: "For paying customers only.",
  },
  {
    number: "04",
    title: "Keep voices low",
    description: "Please be mindful of your noise level.",
  },
  {
    number: "05",
    title: "Please don't move the chairs",
    description: "",
  },
  {
    number: "06",
    title: "Charging fee",
    description: "₱20 per hour.",
  },
  {
    number: "07",
    title: "CLAYGO.",
    description: "",
  },
];

export default function Home(): ReactElement {
  return (
    <main className="landing-page welcome-page">
      <article className="welcome-card">
        <header className="welcome-header">
          <p className="welcome-kicker">Specialty coffee · Iloilo City</p>
          <div className="welcome-logo">
            <Image src={brandLogo} alt="ÑUWAVE Specialty Coffee" sizes="(max-width: 520px) 180px, 220px" priority />
          </div>
          <p className="welcome-tagline">Don’t just drink coffee, experience it.</p>
        </header>
        <div className="welcome-body">
          <section aria-labelledby="welcome-title">
            <div className="welcome-intro">
              <h2 id="welcome-title">Welcome to ÑUWAVE</h2>
              <p>A few little things to make everyone’s visit lovely.</p>
            </div>
            <h3 className="welcome-rules-title">HOUSE RULES</h3>
            <ul className="welcome-rules">
              {houseRules.map((rule) => (
                <li key={rule.title}>
                  <span className="welcome-rule-number">{rule.number}</span>
                  <div>
                    <h4>{rule.title}</h4>
                    {rule.description ? <p>{rule.description}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <a className="welcome-menu-link" href="/menu">
            Explore our menu
          </a>
          <p className="welcome-signoff">ÑUWAVE Specialty Coffee · Crafted for your everyday moments.</p>
        </div>
      </article>
    </main>
  );
}
