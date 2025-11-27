import React, { useState, useEffect } from 'react';
import './SideNav.css';

interface SideNavProps {
  sections: Array<{ id: string; label: string }>;
}

const SideNav: React.FC<SideNavProps> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active section

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 80;
      const elementPosition = section.offsetTop;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="side-nav">
      <ul className="side-nav-list">
        {sections.map((section) => (
          <li key={section.id} className="side-nav-item">
            <button
              className={`side-nav-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => scrollToSection(section.id)}
              aria-label={`Navigate to ${section.label}`}
            >
              <span className="side-nav-indicator"></span>
              <span className="side-nav-label">{section.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNav;
