import Link from "next/link";

import React, { useState } from "react";
import NavItem from "./NavItem";

const MENU_LIST = [
    { text: "主页", href: "/" },
    { text: "对话", href: "/chat" },
    { text: "数据管理", href: "/azure" }
];

const Navbar = () => {

    const [navActive, setNavActive] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    return (
        <header>
            <header>
                <nav className={`nav`}>

                    <div
                        onClick={() => setNavActive(!navActive)}
                        className={`nav__menu-bar`}
                    >
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div className={`${navActive ? "active" : ""} nav__menu-list`}>
                        {MENU_LIST.map((menu, idx) => (
                            <div
                                onClick={() => {
                                    setActiveIdx(idx);
                                    setNavActive(false);
                                }}
                                key={menu.text}
                            >
                                <NavItem active={activeIdx === idx} {...menu} />
                            </div>
                        ))}
                    </div>
                </nav>
            </header>
        </header>
    );
};
export default Navbar;
