import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/layout/provider/Theme";

const Logo = ({ to }) => {
  const theme = useTheme();
  const isDark = theme.skin === "dark";

  return (
    <Link to={to ? to : `/app-kanban`} className="logo-link no-underline">
      <div className="flex items-center gap-[10px]">
        {/* JS Icon Box — project accent color #6576ff */}
        <div className="w-[34px] h-[34px] bg-[#6576ff] rounded-lg flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(101,118,255,0.35)]">
          <span className="text-white font-extrabold text-[13px] tracking-[-0.3px] font-[inherit]">JS</span>
        </div>

        {/* Brand Name — dark/light theme */}
        <span
          className={`font-bold text-[15px] tracking-[-0.2px] font-[inherit] transition-colors duration-200 ${
            isDark ? "text-white" : "text-[#364a63]"
          }`}
        >
          Jagjit Singh
        </span>
      </div>
    </Link>
  );
};

export default Logo;
