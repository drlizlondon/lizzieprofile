import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Box,
  Brain,
  Heart,
  Mail,
  Mic2,
  PenLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ContentProvider, EditableText, EditPanel, useContent } from "./editing/ContentEditor";
import heroPhoto from "./assets/lizzie-hero.png";
import "./styles.css";

const iconMap = {
  heart: Heart,
  brain: Brain,
  trending: TrendingUp,
  box: Box,
  pen: PenLine,
};

function HeroImageStage() {
  const { content } = useContent();

  return (
    <div className="hero-image-stage" aria-label="Editorial working portrait">
      <div className="portrait-frame">
        <img src={heroPhoto} alt="" />
        <div className="portrait-warmth" />
        <div className="portrait-clarity" />
        <div className="portrait-grain" />
      </div>
      <div className="lower-card paper-surface" hidden>
        <div className="note-tape" />
        <EditableText path="hero.lowerCardBody" as="p" multiline />
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <article className="project-tile">
      <div className={`phone-mock ${project.palette}`}>
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-content">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="project-info">
        <EditableText path={`projects.items.${index}.status`} as="span" />
        <EditableText path={`projects.items.${index}.text`} as="p" multiline />
        <a href="#contact" aria-label={`View ${project.name}`}>
          <ArrowRight size={18} />
        </a>
      </div>
      <EditableText path={`projects.items.${index}.name`} as="h3" />
    </article>
  );
}

function Homepage() {
  const { content } = useContent();

  return (
    <main className="site-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <a className="brand" href="#">
            <EditableText path="brand.name" as="span" />
            <EditableText path="brand.subtext" as="small" />
          </a>
          <nav aria-label="Main navigation">
            {content.nav.map((_, index) => (
              <a key={`nav-${index}`} href={`#${content.nav[index].toLowerCase()}`}>
                <EditableText path={`nav.${index}`} />
              </a>
            ))}
          </nav>
          <a className="round-icon" href="#contact" aria-label="Contact">
            <Mail size={17} />
          </a>
        </div>
      </header>

      <section className="hero-section" id="about">
        <div className="hero-copy">
          <EditableText path="hero.kicker" as="p" className="hero-kicker" />
          <h1>
            <EditableText path="hero.line1" />
            <br />
            <EditableText path="hero.line2" />
            <br />
            <EditableText path="hero.line3Prefix" />{" "}
            <EditableText path="hero.handwritten" as="em" />
          </h1>
          <EditableText path="hero.body" as="p" className="hero-body" multiline />
          <div className="hero-actions">
            <a className="button primary" href="#projects">
              <EditableText path="hero.primaryCta" /> <ArrowRight size={17} />
            </a>
            <a className="text-link" href="#about">
              <EditableText path="hero.secondaryCta" /> <ArrowRight size={15} />
            </a>
          </div>
        </div>
        <HeroImageStage />
      </section>

      <section className="site-progress" id="projects" aria-label="Site progress">
        <div className="site-progress-inner">
          <p className="site-progress-title">Site currently evolving.</p>
          <p className="site-progress-copy">
            Selected work and writing are being curated and added gradually.
          </p>
          <p className="site-progress-micro">Full archive coming soon.</p>
          <span className="site-progress-note">building quietly</span>
        </div>
      </section>
      <EditPanel />
    </main>
  );
}

function App() {
  return (
    <ContentProvider>
      <Homepage />
    </ContentProvider>
  );
}

const rootElement = document.getElementById("root");
const root = window.__lizziePortfolioRoot ?? createRoot(rootElement);
window.__lizziePortfolioRoot = root;
root.render(<App />);
