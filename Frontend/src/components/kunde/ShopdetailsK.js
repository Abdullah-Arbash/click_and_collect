import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import fetchapi from "../../module/fetchapi";
import Offnungzeiten from "../Offnungzeiten";

function ShopdetailsK (props){

    const [shopdaten, setshopdaten] = useState({shopname:'', shopkategorie:'', shopemail:'', telefonnummer:'', oeffnungszeiten:{mo:{von:'',bis:''},di:{von:'',bis:''},mi:{von:'',bis:''},do:{von:'',bis:''},
    fr:{von:'', bis:''},sa:{von:'',bis:''},so:{von:'',bis:''}}, adresse:{straße:'', postleitzahl:'', ortschaft:'', land:''}})

   /* "function shopdetailsanzeigen(){
        console.log('Shopdetails ausgegeben.')
        let input = {
            "first": "shops",
            "second": "shopNachKategorie",
            "shopId": "shopId"
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            setshopdaten(res.data.data)
            console.log(res.data.data)
        })
    }

    useEffect(() =>{
        shopdetailsanzeigen()
    },[])" */

    return(
        <div className="shopdetails">
            <p className="data">Shop-Name: <span className='data-wert' onClick={props.shopnameclick} style={{cursor: 'pointer'}}> Shop 1{shopdaten.shopname}</span></p>
            <p className="data">Shop-Kategorie: <span className='data-wert'>{shopdaten.shopkategorie}</span></p>
            <p className="data">E-Mail Adresse: <span className="data-wert">{shopdaten.shopemail}</span></p>
            <div>
                <p className="data" style={{margin: 0}}>Adresse:</p>
                <ul style={{listStyle: 'none'}}>
                    <li><span>Straße: <span className='adresse-d'>{shopdaten.straße}</span></span></li>
                    <li><span>Postleitzahl: <span className='adresse-d'>{shopdaten.postleitzahl}</span></span></li>
                    <li><span>Ort: <span className='adresse-d'>{shopdaten.ortschaft}</span></span></li>
                    <li><span>Land: <span className='adresse-d'>{shopdaten.land}</span></span></li>
                </ul>
            </div>
            <p className="data">Telefonnummer: <span className='data-wert'>{shopdaten.telefonnummer}</span></p>
            <div>
                <p className='data' style={{margin:0}}>Öffnungszeiten:</p>
                    {shopdaten.oeffnungszeiten === 'Noch nicht definiert' ? <p>{shopdaten.oeffnungszeiten}</p> :<Offnungzeiten z={shopdaten.oeffnungszeiten} />} 
            </div>
        </div>
    )
}

export default ShopdetailsK;