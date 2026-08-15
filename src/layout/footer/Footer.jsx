import React from "react";

const Footer = () => {
  return (
    <div className="nk-footer">
      <div className="container-fluid">
        <div className="nk-footer-wrap">
          <div className="nk-footer-copyright">
            &copy; {new Date().getFullYear()} Jagjit Singh. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
