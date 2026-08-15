import React from "react";

const AuthFooter = () => {
  return (
    <div className="nk-footer nk-auth-footer-full">
      <div className="container wide-lg">
        <div className="nk-block-content text-center">
          <p className="text-soft">&copy; {new Date().getFullYear()} Jagjit Singh. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};
export default AuthFooter;
