import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/layout/provider/Theme";

const Logo = ({ to }) => {
  const theme = useTheme();
  const isDark = theme.skin === "dark";

  return (
    <Link to={to ? to : `/app-kanban`} className="logo-link" style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        {/* JS Icon Box — project accent color #6576ff */}
        <div style={{
          width: "34px",
          height: "34px",
          background: "#6576ff",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(101,118,255,0.35)",
        }}>
          <span style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: "13px",
            letterSpacing: "-0.3px",
            fontFamily: "inherit",
          }}>JS</span>
        </div>

        {/* Brand Name — dark/light theme ke hisaab se */}
        <span style={{
          fontWeight: "700",
          fontSize: "15px",
          letterSpacing: "-0.2px",
          fontFamily: "inherit",
          color: isDark ? "#fff" : "#364a63",
          transition: "color 0.2s ease",
        }}>Jagjit Singh</span>
      </div>
    </Link>
  );
};

export default Logo;
