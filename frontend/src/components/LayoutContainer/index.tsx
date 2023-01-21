// @flow
import { useContext, useEffect, useRef } from "react";
import LayoutManager from "utils/layout-manager";
import lodash from "lodash";
import './styles.css';

import "./styles.css";
import { SessionContext } from "contexts/session";
import { Subscriber } from "@opentok/client";

interface ILayoutContainer { 
  id: string; 
  size: "big" | "small" | "screen";
  hidden?: boolean;
  children?: any;
}

function LayoutContainer({ id, size = "big", children }: ILayoutContainer){
  
  const mSession = useContext(SessionContext);
  const { session , subscribers, streams } = mSession;
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<any>();

  useEffect(() => {
    layoutRef.current = new LayoutManager(id);
  }, [id, session]);

  useEffect(() => {
    if(layoutRef.current) layoutRef.current.layout()
  }, [session, subscribers, size, streams]);

  return (
    <div 
      id={id} 
      ref={containerRef}
      className='layoutContainer'
      >
      {children}
    </div>
  );
}
export default LayoutContainer;