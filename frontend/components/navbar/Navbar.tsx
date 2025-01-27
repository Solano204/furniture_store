import Container from "../global/Container";
import CartButton from "./CartButton";
import DarkMode from "./DarkMode";
import LinksDropdown from "./LinksDropdown";
import Logo from "./Logo";
import NavSearch from "./NavSearch";
import { Suspense } from 'react';


// THIS IS THE NAVBAR COMPLETE 

function Navbar() {
  return (
    <nav className=" border-b border-black ">
      <Container className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap py-8 ">
        <Logo />
    <Suspense>
          <NavSearch />
    </Suspense>
          
        <div className=" flex gap-4 items-center">
          <CartButton />
          <DarkMode />
          <LinksDropdown />
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;
