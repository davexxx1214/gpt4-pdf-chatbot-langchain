import Link from "next/link";
const NavItem = ({ text, href, active }) => {
  return (
    <Link href={href}>
      <div className={`nav__link`}>
        {text}
        </div>
    </Link>
  );
};

export default NavItem;
