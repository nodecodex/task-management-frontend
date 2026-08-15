import React from "react";
import classNames from "classnames";
import {
  FiMinus, FiPlus, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight,
  FiArrowUp, FiArrowDown, FiGlobe, FiMonitor, FiSmartphone, FiTablet, FiMoreHorizontal,
  FiSettings, FiBell, FiArrowDownLeft, FiArrowUpLeft, FiInfo, FiUsers, FiClock,
  FiDownloadCloud, FiCopy, FiEye, FiEdit2, FiEdit3, FiCheckCircle, FiCheckSquare, FiCheck,
  FiX, FiHome, FiMessageSquare, FiMenu, FiTrash2, FiTrash, FiCalendar, FiFileText,
  FiMoreVertical, FiAlertCircle, FiEyeOff, FiGrid, FiUser, FiLogOut, FiSun, FiMoon,
  FiShare2, FiChevronDown, FiChevronUp, FiTag, FiFlag, FiFolder, FiSend, FiPaperclip,
  FiSearch, FiFilter, FiActivity, FiLayers, FiLock, FiLayout, FiMaximize2, FiMinimize2,
  FiThumbsUp, FiCornerUpLeft, FiList, FiColumns, FiTrello
} from 'react-icons/fi';
import { FaCreditCard, FaWallet } from 'react-icons/fa';
import { MdArrowForwardIos, MdHelp } from 'react-icons/md';

const iconMap = {
  "minus": FiMinus,
  "plus": FiPlus,
  "chevrons-left": FiChevronsLeft,
  "chevron-left": FiChevronLeft,
  "chevron-right": FiChevronRight,
  "chevrons-right": FiChevronsRight,
  "arrow-long-up": FiArrowUp,
  "arrow-long-down": FiArrowDown,
  "globe": FiGlobe,
  "monitor": FiMonitor,
  "mobile": FiSmartphone,
  "tablet": FiTablet,
  "more-h": FiMoreHorizontal,
  "setting": FiSettings,
  "notify": FiBell,
  "cc-alt-fill": FaCreditCard,
  "forward-ios": MdArrowForwardIos,
  "help-fill": MdHelp,
  "wallet-fill": FaWallet,
  "arrow-down-left": FiArrowDownLeft,
  "arrow-up-left": FiArrowUpLeft,
  "info": FiInfo,
  "users": FiUsers,
  "alarm-alt": FiClock,
  "download-cloud": FiDownloadCloud,
  "opt-alt": FiGrid,
  "copy": FiCopy,
  "eye": FiEye,
  "edit": FiEdit2,
  "edit-alt": FiEdit3,
  "check-round-cut": FiCheckCircle,
  "check-square": FiCheckSquare,
  "check": FiCheck,
  "clock": FiClock,
  "cross": FiX,
  "home": FiHome,
  "msg": FiMessageSquare,
  "comments": FiMessageSquare,
  "menu-alt-r": FiMenu,
  "menu": FiMenu,
  "user": FiUser,
  "user-alt": FiUser,
  "signout": FiLogOut,
  "sun": FiSun,
  "moon": FiMoon,
  "trash": FiTrash2,
  "trash-empty": FiTrash,
  "calendar": FiCalendar,
  "notes": FiFileText,
  "more-v": FiMoreVertical,
  "plus-sm": FiPlus,
  "cross-sm": FiX,
  "cross": FiX,
  "alert-circle": FiAlertCircle,
  "eye-off": FiEyeOff,
  "share": FiShare2,
  "share-alt": FiShare2,
  "chevron-down": FiChevronDown,
  "chevron-up": FiChevronUp,
  "down-sm": FiChevronDown,
  "up-sm": FiChevronUp,
  "tag": FiTag,
  "tags": FiTag,
  "flag": FiFlag,
  "folder": FiFolder,
  "send": FiSend,
  "paperclip": FiPaperclip,
  "search": FiSearch,
  "filter": FiFilter,
  "activity": FiActivity,
  "layers": FiLayers,
  "lock": FiLock,
  "layout": FiLayout,
  "maximize": FiMaximize2,
  "minimize": FiMinimize2,
  "thumbs-up": FiThumbsUp,
  "reply": FiCornerUpLeft,
  "kanban": FiColumns,
  "list": FiList,
  "view-grid": FiGrid,
  "view-list": FiList,
  "columns": FiColumns,
  "table": FiGrid,
  "trello": FiTrello,
};

const Icon = ({ name, id, className, style, ...props }) => {
  const MappedIcon = iconMap[name];

  const iconClass = classNames({
    [`${className}`]: className,
    icon: true,
    ni: true,
  });

  if (MappedIcon) {
    return (
      <span className={iconClass} id={id} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} {...props}>
        <MappedIcon />
      </span>
    );
  }

  // Fallback to old rendering if icon is not mapped
  return <em className={iconClass} id={id} style={style} {...props}></em>;
};

export default Icon;
