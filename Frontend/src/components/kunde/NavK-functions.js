import React, {useContext} from 'react';
import Button from 'react-bootstrap/Button';
import { sectionContact } from '../../Contect';


function NavKfunctions(props) {
    const {setsection} = useContext(sectionContact)
    let buttons= props.aufgaben.map((aufgabe)=>{return <Button variant="success" onClick={aufgabeClick} value={aufgabe} key={Math.random()}>{aufgabe}</Button>})
    function aufgabeClick(event){
        setsection(event.target.value)
        props.click()
    }
    return ( 
        <div className='navk-functions'>
            {buttons}
        </div>
     );
}

export default NavKfunctions;