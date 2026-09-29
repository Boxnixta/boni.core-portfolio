import Link from "next/link";
import HeaderNav from "./HeaderNav";
import { ButtonEmail } from "./ButtonEmail";

const Header = () => {
  return (
      <header className="site-header">
          <Link href="/" className="site-header-name">
              [boni.core]
          </Link>

          <HeaderNav />

          <ButtonEmail
              email="bonigizy@gmail.com"
              subject="Hey, jutst wanted to say hi!"
              className="btn"
          >
              Kontakt
          </ButtonEmail>
      </header>
  );
};

export default Header;
