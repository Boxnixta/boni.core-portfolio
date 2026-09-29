const Contact = () => (
    <div className="contact-page">
        <div className="contact-main">
            <div className="hey-heading contact-heading">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/hey-spray-illu.png" alt="" className="hey-spray" />
                <h1 className="hey-title">Contact</h1>
            </div>

            {/* Flowers bloom around the contact details on hover / keyboard focus */}
            <div className="contact-details group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/contact/Flower_illustration.png" alt="" className="contact-flowers" />
                <p>
                    <span className="contact-label">E-Mail</span> –{" "}
                    <a href="mailto:bonigizy@gmail.com?subject=Hey%2C%20just%20wanted%20to%20say%20hi!" className="contact-link">
                        bonigizy@gmail.com
                    </a>
                </p>
                <p>
                    <span className="contact-label">Phone</span> –{" "}
                    <a href="tel:+491773019355" className="contact-link">
                        +49 177 3019355
                    </a>
                </p>
            </div>
        </div>

        <aside className="contact-aside">
            {/* Two stacked drawings: the second one blinks now and then, and chews on hover */}
            <div className="burger-girl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/contact/Illustration-Eating-Burger-1.png" alt="Illustration of Bonita eating a burger" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/contact/Illustration-Eating-Burger-2.png" alt="" className="burger-girl-blink" />
            </div>
            <div className="contact-text">
                <p>
                    I&apos;m Bonita – a designer focused on <strong>graphic design, illustration, 3D design, animation
                    and film</strong>. My strength lies in developing thoughtful visual concepts that connect design and
                    content – from the first draft to the final execution.
                </p>
                <p>
                    I&apos;m especially excited about visual storytelling, interactive media and all phases of film
                    production.
                </p>
                <p>
                    Thanks to my quick grasp and analytical approach, I get into <strong>new topics, tools and
                    technologies</strong> quickly and in a structured way.
                </p>
                <p>
                    <strong><em>I look forward to hearing from you and to exciting new projects.</em></strong>
                </p>
            </div>
        </aside>
    </div>
);

export default Contact;
