import React, {useEffect} from "react";
import { Outlet } from "react-router-dom";
import Head from "./head/Head";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import AppRoot from "./global/AppRoot";
import AppMain from "./global/AppMain";
import AppWrap from "./global/AppWrap";

import { useTheme } from "./provider/Theme";
import { TaskProvider } from "./provider/TaskContext";

const Layout = ({title, ...props}) => {
  const theme = useTheme();

  useEffect(() => {
    document.body.classList.add("npc-apps","apps-only")
  }, [])

  return (
      <TaskProvider>
        <Head title={!title && 'Loading'} />
        <AppRoot>
          <AppMain>
            <AppWrap>
              <Header fixed />
              <div className="nk-content">
              <div className="container wide-xl">
                <div className="nk-content-inner">
                  <div className="nk-content-body">
                    <Outlet />
                    <Footer />
                  </div>
                </div>
              </div>
            </div>
            </AppWrap>
          </AppMain>
        </AppRoot>
      </TaskProvider>
  );
};
export default Layout;
