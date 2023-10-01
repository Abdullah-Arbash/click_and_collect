import React from 'react';
import '../css/section.css';


function Section(props) {
    return ( 
        <section className='section-o'>
            <h4>{props.name}</h4>
            <div className='section'>
              <div>{props.children}</div>
            </div>
        </section>
        
     );
}

export default Section;