import React from 'react';
import { Card } from 'react-bootstrap';
import { BsFillBasket2Fill, BsSuitHeart } from 'react-icons/bs';
import '../../css/kunde.css';


function ProduktK(props){

  const style = {
    width: '250px',
    margin: '10px 10px 10px 10px',
    cursor: 'pointer',
    height:'350px',    
  }

  const imgStyle = {
    width: 'auto',
    marginTop:'0px',
    maxHeight: '150px',
    objectFit: 'cover',
    borderRadius: '10px 10px 0px 0px'
  };

    return(
      <div className='text-center'>
        <Card className='produkt' style={style}>
            <img style={imgStyle} variant="top" src={props.bild} alt='foto'/>
              <Card.Body>
                <Card.Title style={{color:'blue'}} onClick={props.produktclick}>{props.name}</Card.Title>
                 <Card.Text>{props.beschreibung}</Card.Text>
                 <Card.Text style={{fontWeight:700}}>{props.preis}&#8364;</Card.Text>
                 <BsSuitHeart style={{color:'red', fontSize:'24px', marginLeft: '5px'}} onClick={props.wlclick}></BsSuitHeart> <BsFillBasket2Fill style={{color:'green',fontSize:'24px', marginLeft: '130px'}} onClick={props.wkclick}></BsFillBasket2Fill>
              </Card.Body>
    </Card>
    </div>
    )
}

export default ProduktK;