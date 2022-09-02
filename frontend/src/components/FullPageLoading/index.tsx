import React from "react";
import './styles.css'

function FullPageLoading(){
  const styles = { 
    default: {

    }
  }
  return(
    <div className="loadingPage">
      <div className="loadingSpinner"/>
    </div>
  )
}

export default FullPageLoading