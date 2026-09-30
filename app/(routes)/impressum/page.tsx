import type { Metadata } from "next";

/*
  Impressum (§ 5 DDG) + privacy policy (GDPR) in one page.
  noindex: search engines are asked not to list this page, so your address
  does not show up in Google results (it is still reachable via the footer link, as required).

  ▶ Fill in your address in ADDRESS below (only here, nowhere else on the site).
*/
export const metadata: Metadata = {
    title: "Impressum & Privacy",
    robots: { index: false, follow: false },
};

const NAME = "Bonita von Gizycki";
const ADDRESS = ["Leibnizring 43", "14480 Potsdam", "Germany"];
const EMAIL = "bonigizy@gmail.com";

const ImpressumPage = () => (
    <section className="legal-page">
        <h1>Impressum</h1>
        <p className="legal-sub">Legal notice according to § 5 DDG</p>
        <p>
            {NAME}
            {ADDRESS.map((line) => (
                <span key={line}>
                    <br />
                    {line}
                </span>
            ))}
        </p>
        <p>
            E-Mail: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
        <p>Responsible for the content according to § 18 (2) MStV: {NAME}, address as above.</p>

        <h2>Liability for links</h2>
        <p>
            This site links to external websites (e.g. Instagram, LinkedIn, GitHub, YouTube). I have no influence on their content,
            so I cannot accept any liability for it. The respective provider is always responsible. If I become aware of any
            infringements, I will remove such links immediately.
        </p>

        <h2>Copyright</h2>
        <p>
            All works on this site (images, videos, illustrations, texts, code) are by me unless stated otherwise and are
            protected by copyright. Please ask before using them. Music in the Blob Audio Reactor: Pixabay Content License.
        </p>

        <h1 className="mt-16">Privacy Policy</h1>
        <p className="legal-sub">Datenschutzerklärung</p>

        <h2>1. Controller</h2>
        <p>
            {NAME}, address see above, E-Mail: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>

        <h2>2. Hosting</h2>
        <p>
            This website is hosted by Render Services, Inc., San Francisco, USA.
            When you visit the site, the server automatically stores technical data in log files (IP address, date and time,
            page requested, browser and operating system). This is necessary to deliver the site securely and stably
            (Art. 6 (1) (f) GDPR). Render may process data in the USA; the transfer is based on the EU Standard Contractual
            Clauses. More: <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">render.com/privacy</a>
        </p>

        <h2>3. No cookies, no tracking</h2>
        <p>
            This site does not use cookies, analytics or tracking tools. Fonts are stored on this server, so no connection to
            Google Fonts is made.
        </p>

        <h2>4. Embedded content (only after a click)</h2>
        <p>
            Videos from YouTube (in privacy-enhanced mode, youtube-nocookie.com) and live demos from GitHub Pages are only
            loaded when you click on them. Only then is your IP address sent to Google Ireland Ltd. or GitHub, Inc.
            (Art. 6 (1) (a) GDPR, your consent through the click). Before that, no data is transferred.
        </p>

        <h2>5. Microphone and music files (Blob Audio Reactor)</h2>
        <p>
            If you use the microphone or your own music file in the Blob Audio Reactor, the sound is analysed only in your
            browser. Nothing is recorded, uploaded or stored.
        </p>

        <h2>6. Contact by e-mail</h2>
        <p>
            If you write to me, I use your data only to answer your request (Art. 6 (1) (b) and (f) GDPR) and delete it when it
            is no longer needed. My e-mail is provided by Google (Gmail).
        </p>

        <h2>7. Links to social media</h2>
        <p>
            Instagram, LinkedIn and GitHub are simple links. No data is sent to these services until you click on a link.
        </p>

        <h2>8. Your rights</h2>
        <p>
            You have the right to information, correction, deletion and restriction of processing of your data, to data
            portability and to object (Art. 15–21 GDPR), and to complain to a data protection supervisory authority, e.g. the
            Landesbeauftragte für den Datenschutz und für das Recht auf Akteneinsicht Brandenburg.
        </p>
    </section>
);

export default ImpressumPage;
