import { Mail, CodeXml, MapPin } from "lucide-react";
import FancyText from "@/app/components/boni/FancyText";
import BurgerGirl from "@/app/components/boni/contact/BurgerGirl";

/* eslint-disable @next/next/no-img-element */
const Contact = () => (
    <div className="contact-page">
        <div className="contact-main">
            <div className="hey-heading contact-heading">
                <img src="/img/about/hey-spray-illu.png" alt="" className="hey-spray" draggable={false} />
                <h1 className="hey-title">
                    <FancyText text="Contact" />
                </h1>
            </div>

            <p className="contact-intro">
                Want to work together, talk about a project or just say hi? Send me a message!
            </p>

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
        </aside>
    </div>
);

export default Contact;
