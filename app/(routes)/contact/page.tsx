import { Mail, CodeXml, MapPin } from "lucide-react";
import BurgerGirl from "@/app/components/boni/contact/BurgerGirl";

// Simple outline icons in the lucide style (lucide has no brand logos)
const InstagramIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
);
const LinkedInIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
);

/* eslint-disable @next/next/no-img-element */
const Contact = () => (
    <div className="contact-page">
        <div className="contact-main">
            <div className="hey-heading contact-heading">
                <img src="/img/about/hey-spray-illu.png" alt="" className="hey-spray" draggable={false} />
                <h1 className="hey-title">Contact</h1>
            </div>

            {/* Flowers bloom around the contact details on hover / keyboard focus */}
            <div className="contact-details group">
                <img src="/img/contact/Flower_illustration.png" alt="" className="contact-flowers" draggable={false} />
                <ul>
                    <li>
                        <Mail className="contact-icon" aria-hidden="true" />
                        <span className="contact-label">E-Mail</span>
                        <a href="mailto:bonigizy@gmail.com?subject=Hey%2C%20just%20wanted%20to%20say%20hi!" className="contact-link">
                            bonigizy@gmail.com
                        </a>
                    </li>
                    <li>
                        <InstagramIcon className="contact-icon" />
                        <span className="contact-label">Instagram</span>
                        <a href="https://www.instagram.com/boni.core/" target="_blank" rel="noopener noreferrer" className="contact-link">
                            @boni.core
                        </a>
                    </li>
                    <li>
                        <LinkedInIcon className="contact-icon" />
                        <span className="contact-label">LinkedIn</span>
                        <a href="https://www.linkedin.com/in/bonita-von-gizycki-766300166" target="_blank" rel="noopener noreferrer" className="contact-link">
                            Bonita von Gizycki
                        </a>
                    </li>
                    <li>
                        <CodeXml className="contact-icon" aria-hidden="true" />
                        <span className="contact-label">GitHub</span>
                        <a href="https://github.com/Boxnixta" target="_blank" rel="noopener noreferrer" className="contact-link">
                            Boxnixta
                        </a>
                    </li>
                    <li>
                        <MapPin className="contact-icon" aria-hidden="true" />
                        <span className="contact-label">Based in</span>
                        <span>Potsdam, Germany</span>
                    </li>
                </ul>
            </div>
        </div>

        <aside className="contact-aside">
            <BurgerGirl />
            <p className="contact-intro">
                Want to work together, talk about a project or just say hi? Send me a message!
            </p>
        </aside>
    </div>
);

export default Contact;
