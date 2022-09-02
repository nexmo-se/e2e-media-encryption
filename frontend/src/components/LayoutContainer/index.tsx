// @flow
import { useContext, useEffect, useRef } from "react";
import LayoutManager from "utils/layout-manager";
import lodash from "lodash";
import './styles.css';

import "./styles.css";
import { SessionContext } from "contexts/session";

interface ILayoutContainer { 
  id: string; 
  size: "big" | "small" | "screen";
  hidden?: boolean;
  children?: any;
}

function LayoutContainer({ id, size = "big", children }: ILayoutContainer){
  
  const mSession = useContext(SessionContext);
  const { session , streams } = mSession;
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<any>();

  useEffect(() => {
    layoutRef.current = new LayoutManager(id);
    const observer = new MutationObserver((mutationList => {
      for(const mutation of mutationList){
        if(mutation.type === "childList") layoutRef.current.layout();
      }
    }));
    if(containerRef.current) observer.observe(containerRef.current, { childList: true });
  }, [id, session, streams]);

  useEffect(() => {
    if(layoutRef.current) layoutRef.current.layout()
  }, [session, streams, size]);

  useEffect(() => {
    window.addEventListener("resize", lodash.debounce(() => {
      if(layoutRef.current) layoutRef.current.layout();
    }, 150))
  } , [session, streams])

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