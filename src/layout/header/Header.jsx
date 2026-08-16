import React from "react";
import classNames from "classnames";
import Logo from "../logo/Logo";
import User from "./dropdown/user/User";
import Toggle from "../sidebar/Toggle";
import { NavLink, useLocation } from "react-router-dom";

import { useTheme, useThemeUpdate } from '@/layout/provider/Theme';

const Header = ({ fixed, className, ...props }) => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const location = useLocation();

  const headerClass = classNames({
    "nk-header": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme.header === "white",
    [`is-${theme.header}`]: theme.header !== "white" && theme.header !== "light",
    [`${className}`]: className,
  });

  return (
    <div className={headerClass}>
      <div className="container-lg wide-xl">
        <div className="nk-header-wrap">
          {/* Brand Logo */}
          <div className="nk-header-brand">
            <Logo />
          </div>

          {/* Nav Links */}
          <div className="nk-header-menu">
            <ul className="nk-menu nk-menu-main">
              <li className={`nk-menu-item ${location.pathname === '/app-dashboard' ? 'active current-page' : ''}`}>
                <NavLink to="/app-dashboard" className="nk-menu-link">
                  <span className="nk-menu-text">Dashboard</span>
                </NavLink>
              </li>
              <li className={`nk-menu-item ${location.pathname === '/app-kanban' ? 'active current-page' : ''}`}>
                <NavLink to="/app-kanban" className="nk-menu-link">
                  <span className="nk-menu-text">Kanban</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Right side tools — user dropdown + mobile sidebar toggle */}
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="user-dropdown">
                <User />
              </li>
              <li className="d-lg-none">
                <Toggle icon="menu" className="toggle nk-quick-nav-icon me-n1" click={themeUpdate.sidebarVisibility} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
