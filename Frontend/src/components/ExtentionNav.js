import React, {useContext} from 'react';
import Button from 'react-bootstrap/Button';
import '../css/extentionnav.css';
import { sectionContact } from '../Contect';


function ExtentionNav(props) {
    const {setsection} = useContext(sectionContact)
    let buttons= props.aufgaben.map((aufgabe)=>{return <Button variant="success" onClick={aufgabeClick} value={aufgabe} key={Math.random()}>{aufgabe}</Button>})
    function aufgabeClick(event){
        setsection(event.target.value)
        props.click()
    }
    return ( 
        <div className='extentionNav'>
            {buttons}
        </div>
     );
}

export default ExtentionNav;