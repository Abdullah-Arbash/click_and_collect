import React, { useState } from 'react';
import { Card, Image as Img } from 'react-bootstrap';
import { Icon } from 'react-icons-kit';
import { checkCircle } from 'react-icons-kit/feather/checkCircle';
import { BsFillBackspaceReverseFill } from "react-icons/bs";
import fetchapi from '../module/fetchapi';

function ProduktHM(props) {
  const [menge, setMenge] = useState(props.menge);

  const style = {
    maxWidth: '200px',
    margin: '5px 5px 5px 5px',
    minHeight: '300px',
    backgroundColor: '#f2f2f2',
    borderRadius: '10px',
    boxShadow: '5px 5px 5px #888888',
  };

  const imgStyle = {
    width: '100%',
    marginTop: '10px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px 10px 0px 0px',
  };

  const titleStyle = {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: '10px',
    textAlign: 'center',
  };

  function changemenge(){
    console.log(menge)
    const input={
      first: "mitarbeiter",
      second: "Produktbearbeiten",
      ID: props.id,
      menge: menge,
    }
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      console.log(res)
    })
  }

  function produktdel(){
    console.log('qqq')
    const input={
      first: "mitarbeiter",
      second: "produktLoeschen",
      ID:props.id
    }
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      console.log(res)
      if(res.status){
        if(res.data.status){
          props.ok(res.data.msg)
        }else{
          props.fehler(res.data.msg)
        }
    }else{
        props.fehler('Ein Fehler ist aufgetreten!')
    }
    })
  }

  return (
    <Card style={style}>
     <div style={{display:'flex', justifyContent:'right'}}><BsFillBackspaceReverseFill onClick={()=>{produktdel()}} style={{color:'red', marginTop:'10px', fontSize:'23px',cursor: 'pointer'}}/></div>
      <Img style={imgStyle} variant="top" src={props.bild} alt="foto" />
      <Card.Body>
        <Card.Title style={titleStyle}>{props.name}</Card.Title>
        <Card.Text style={{ textAlign: 'center' }}>
          <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
             <input type="number" value={menge} onChange={(e) => setMenge(e.target.value)} style={{ marginRight: '10px', width:'70px', borderRadius:'3px' }}/>
             <Icon size={25} icon={checkCircle} style={{ color:'green',cursor: 'pointer'}} onClick={()=>{changemenge()}} />
          </div>
        </Card.Text>
        <Card.Text style={{ fontWeight: 700, textAlign: 'center' }}>
          {props.preis}&#8364;
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ProduktHM;