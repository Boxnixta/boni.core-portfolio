const Footer = () => {
  /*
      new Date() runs at build time with output: "export".
      The resulting HTML is frozen at the build date — exactly right
      for a "Last update" notice on a static portfolio.
    */
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
  });

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>
          © {currentYear} [boni.core] |{" "}
          <a href="/impressum" className="underline">
            Impressum
          </a>
        </p>
        <div className="text-gray-500 text-xs">{`Last update: ${currentDate} | Scraping or use in AI training prohibited.`}</div>
        <p>Made in Potsdam with 💖</p>
      </div>
    </footer>
  );
};

export default Footer;
