import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import '../../css/kunde.css';
import { Card } from 'react-bootstrap';
import { BsFillTrashFill } from "react-icons/bs";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";




function X(props){
    const style = {
        width: '200px',
        margin: '10px 10px 10px 10px',
        cursor: 'pointer',
        height:'350px',
      }

      const imgStyle = {
        width: '100%',
        marginTop:'0px',
        maxHeight: '250px',
        objectFit: 'cover',
        borderRadius: '10px 10px 0px 0px'
      };
      

    return(
        <div>
                <Card className='text-center' style={style}>
                    <img style={imgStyle} variant="top" src={props.bild} alt='foto'/>
                    <Card.Body>
                        <Card.Title style={{fontWeight:800}}>{props.P_Name}</Card.Title>
                        <p>{props.H_name}</p>
                        <div className='mengeAendern' style={{display:'flex',alignItems:'center', justifyContent:'center'}}>
                        <AiFillMinusCircle onClick={props.minusclick}></AiFillMinusCircle>
                        <h4>{props.Bestellmenge}</h4>
                        <AiFillPlusCircle onClick={props.plusclick}></AiFillPlusCircle> 
                        </div>
                        <Card.Text style={{fontWeight:500}}>€ {props.Preis}</Card.Text>
                        < BsFillTrashFill onClick={props.loeschenclick}/>
                    </Card.Body>
                </Card>
        </div>
    )
}


export default X;