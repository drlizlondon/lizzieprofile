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

      <section className="work-strip" id="ideas">
        <div className="section-rule" />
        <div className="work-heading">
          <EditableText path="work.title" as="h2" />
        </div>
        <div className="work-columns">
          {content.work.areas.map((area, index) => {
            const Icon = iconMap[area.icon] ?? Sparkles;
            return (
              <article key={`work-${index}`}>
                <Icon size={30} strokeWidth={1.35} />
                <EditableText path={`work.areas.${index}.title`} as="h3" multiline />
                <EditableText path={`work.areas.${index}.text`} as="p" multiline />
              </article>
            );
          })}
        </div>
      </section>

      <section className="projects-section" id="projects">
        <div className="projects-heading">
          <div>
            <EditableText path="projects.title" as="h2" />
            <EditableText path="projects.note" as="p" />
          </div>
          <a href="#contact">
            <EditableText path="projects.viewAll" /> <ArrowRight size={18} />
          </a>
        </div>
        <div className="project-row">
          {content.projects.items.map((project, index) => (
            <ProjectCard key={`project-${index}`} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="journal-grid" id="journal">
        <div className="journal-block">
          <div className="block-heading">
            <EditableText path="journal.title" as="h2" />
            <a href="#contact">
              <EditableText path="journal.viewAll" /> <ArrowRight size={16} />
            </a>
          </div>
          <div className="article-cards">
            {content.journal.articles.map((_, index) => (
              <article key={`article-${index}`}>
                <div className="article-image" />
                <EditableText path={`journal.articles.${index}`} as="h3" multiline />
                <EditableText path={`journal.readTimes.${index}`} as="span" />
              </article>
            ))}
          </div>
        </div>
        <div className="thinking-pad paper-surface">
          <EditableText path="thinking.title" as="h2" />
          {content.thinking.items.map((_, index) => (
            <EditableText
              key={`thinking-${index}`}
              path={`thinking.items.${index}`}
              as="p"
              multiline
            />
          ))}
        </div>
        <aside className="speaking-card" id="speaking">
          <Mic2 size={86} strokeWidth={1} />
          <EditableText path="speaking.title" as="h2" />
          {content.speaking.topics.map((_, index) => (
            <EditableText key={`topic-${index}`} path={`speaking.topics.${index}`} as="p" />
          ))}
          <a href="#contact">
            <EditableText path="speaking.viewTopics" /> <ArrowRight size={16} />
          </a>
        </aside>
      </section>

      <footer className="footer-section" id="contact">
        <div className="footer-about">
          <div className="footer-photo" />
          <div>
            <EditableText path="footer.title" as="h2" />
            <EditableText path="footer.body" as="p" multiline />
            <a href="#about">
              <EditableText path="footer.more" /> <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="connect-card paper-surface">
          <EditableText path="footer.connectTitle" as="h2" />
          <EditableText path="footer.connectBody" as="p" multiline />
          <a className="button primary" href="mailto:hello@example.com">
            <EditableText path="footer.cta" /> <ArrowRight size={17} />
          </a>
        </div>
        <div className="social-links">
          {content.footer.social.map((_, index) => (
            <a key={`social-${index}`} href={index === 2 ? "mailto:hello@example.com" : "#"}>
              <EditableText path={`footer.social.${index}`} />
            </a>
          ))}
        </div>
      </footer>
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
