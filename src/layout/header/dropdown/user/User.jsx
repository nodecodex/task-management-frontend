import React, { useState } from "react";
import UserAvatar from "@/components/user/UserAvatar";
import { DropdownToggle, DropdownMenu, Dropdown } from "reactstrap";
import { LinkList } from "@/components/links/Links";
import { useTheme, useThemeUpdate } from "@/layout/provider/Theme";
import Icon from "@/components/icon/Icon";
import { useAuth } from "@/context/AuthContext";
import { findUpper } from "@/utils/Utils";
import { useNavigate } from "react-router-dom";

const User = () => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggle = () => {
    themeUpdate.sidebarHide();
    setOpen((prevState) => !prevState);
  };

  const handleLogout = (ev) => {
    ev.preventDefault();
    logout();
    navigate('/auth-login');
  };

  const userName = user?.name || "User";
  const userEmail = user?.email || "user@example.com";
  const userInitials = findUpper(userName) || "U";
  const userRole = user?.role || "MEMBER";

  return (
    <Dropdown isOpen={open} className="user-dropdown" toggle={toggle}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        className="dropdown-toggle"
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <div className="user-toggle">
          <UserAvatar text={userInitials} theme="primary" className="sm" />
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md dropdown-menu-s1">
        <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
          <div className="user-card sm">
            <div className="user-avatar bg-primary">
              <span>{userInitials}</span>
            </div>
            <div className="user-info">
              <span className="lead-text">{userName}</span>
              <span className="sub-text">{userEmail}</span>
              <span className="badge badge-dim bg-outline-primary mt-1">{userRole}</span>
            </div>
          </div>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <li>
              <a
                className={`dark-switch ${theme.skin === 'dark' ? 'active' : ''}`}
                href="#theme"
                onClick={(ev) => {
                  ev.preventDefault();
                  themeUpdate.skin(theme.skin === 'dark' ? 'light' : 'dark');
                }}
              >
                {theme.skin === 'dark' ? (
                  <><Icon name="sun" /><span>Light Mode</span></>
                ) : (
                  <><Icon name="moon" /><span>Dark Mode</span></>
                )}
              </a>
            </li>
          </LinkList>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <li>
              <a href="#logout" onClick={handleLogout} className="d-flex align-items-center">
                <Icon name="signout" className="me-2" />
                <span>Sign Out</span>
              </a>
            </li>
          </LinkList>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default User;
