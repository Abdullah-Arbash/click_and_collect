import React from 'react';

import '../css/spiner.css'

function Spiner(){
    return(
        <div className="page-overlay">
      <div className="loader">
        <div className="loader-circle"></div>
      </div>
    </div>
    )
}

export default Spiner;