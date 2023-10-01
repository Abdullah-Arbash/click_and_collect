import React, { useContext, useDebugValue, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Row } from 'react-bootstrap';
import { sectionContact } from '../../Contect';
import fetchapi from '../../module/fetchapi';
import Section from '../Section';
import Offnungzeiten from "../Offnungzeiten";
import ProduktK from './ProduktK';
import '../../css/kunde.css';
import { AiFillMinusCircle, AiFillPlusCircle } from 'react-icons/ai';

function KundeShops(){

    const [rendern, setrendern] = useState('shopkategorien');
    
    const [fehler, setfehler] = useState('')
    const [perfect, setperfect] = useState(false)
    const [warning, setwarning] = useState(false)
    const [spiner, setspiner] = useState(false)
    const {section, setsection} = useContext(sectionContact);
    const [shopkategorieK, setshopkategoriek] = useState([]);
    const [shopkdrop, setshopkdrop] = useState(false);
    const [shopsk, setshopsk] = useState([]);
    const [skategorie, setskategorie] = useState('');
    const [shopdrop, setshopdrop] = useState(false);
    const [kNr, setkNr] = useState(null);
    const [shNr, setshNr] = useState(null);
    const [PKNr, setPKNr] = useState(null);
    const [SNr, setSNr] = useState(null);
    const [shopnamedrop, setshopnamedrop] = useState(false);
    const [x, setx] = useState(1);
    const [y, sety] = useState(1);
    const [z, setz] = useState(1);
    const [m, setm] = useState(1);
    const [wk, setwk] = useState(1);
    const [wl, setwl] = useState(1);
    const [shopdaten, setshopdaten] = useState({shopname:'', shopkategorie:'', shopemail:'', telefonnummer:'', oeffnungszeiten:{mo:{von:'',bis:''},di:{von:'',bis:''},mi:{von:'',bis:''},do:{von:'',bis:''},
    fr:{von:'', bis:''},sa:{von:'',bis:''},so:{von:'',bis:''}}, adresse:{straße:'', postleitzahl:'', ortschaft:'', land:''}});
    const [produktkategorie, setproduktkategorie] = useState([]);
    const [produktkategoriedrop, setproduktkategoriedrop] = useState(false);
    const [produkte, setprodukte] = useState([]);
    const [produktdrop, setproduktdrop] = useState(false);
    const [opentime, setopentime] = useState([]);

    // Bestellmenge
    const [bok, setbok] = useState('');
    const [bfehler, setbfehler] = useState('');

    
   //  const [spiner, setspiner] = useState(false);
    const style = {
        maxWidth: '200px',
        margin: '5px 5px 5px 5px', // top, right, bottom, left
      };
     

    // Produktdetails
    const imgStyle = {
        width: '100%',
        marginTop:'10px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px 10px 0px 0px'
      };
    const [pd, setpd] = useState(1);
    const [pdetails, setpdetails] = useState([]);
    const [pnr, setpnr] = useState(null);

    const [p_anzahl,setp_anzahl]= useState(1);

    // Shopkategorie
    function shopkategorieAnzeigen() {
        console.log('Shopkategorie ausgegeben.')
        fetchapi('POST',{}, '/shopcategories').then((res)=>{
             setshopkategoriek(res.data.data)
             console.log(res.data.data)
        })
   }
   
   useEffect(()=>{
        shopkategorieAnzeigen()
   },[])

   // Shops einer Kategorie
   function shopkclick (x) {
   console.log(x)
   setkNr(x) 
   shopsAnzeigen()
   setrendern('shops')
   setx((prev)=>{return prev+1})
   }

    function click(){setshopkdrop(false)}

    function shopsAnzeigen(){
        console.log("Shops ausgegeben.")
        
        let input = {
            first: "shops",
            second: "shopNachKategorie",
            shopkategorieID: kNr
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            console.log(res)
            setshopsk(res.data.data)
            setskategorie(res.data.details)
            //setspiner(false)
            console.log(res.data.details)
        })
    }

    useEffect(()=>{
        if(x>1){
            console.log('Shops ausgegeben.')
            shopsAnzeigen()
        }
    },[x])

    function shz(){
        setrendern('shopkategorien')
   }

    // Shopdetails
    function shopclick (y) {
    setrendern('shopdetails')
    console.log(y)
    setshNr(y)
    shopdetailsanzeigen()
    sety((prev)=>{return prev+1})
    }

    function shopdetailsanzeigen(){
        console.log('Shopdetails ausgegeben.')
        let input = {
            "first": "shops",
            "second": "shopNachShopID",
            "shopID": shNr
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            if(res.status){
                if(res.data.status){
                  setspiner(false)
                  setfehler('')
                  console.log(res)
                  console.log(res.data.details)
                  setopentime(res.data.data)
                  setshopdaten(res.data.details)
                }else{
                  setspiner(false)
                  setfehler(res.data.msg)
                }
              }else{
                setspiner(false)
                setfehler('Ein fehler ist aufgetreten!')
              }
        })
    }

    useEffect(() =>{
        if(y>1){
            console.log('Shopdetails ausgegeben.')
        shopdetailsanzeigen()
        }
    },[y])

    function sdz(){
        setrendern('shops')
   }
    
     // Produktkategorien des Shops
     function shopnameclick (m){
        console.log(m)
        setSNr(m) 
        produktkategorienAnzeigen()
        setrendern('produktkategorien')
        setm((prev)=>{return prev+1})
     }

     function produktkategorienAnzeigen(){
        console.log("Produktkategorien ausgegeben.")
        
        let input = {
            first: "shops",
            second: "produktkategorienNachShop",
            "shopID": SNr
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            setproduktkategorie(res.data.data)
            console.log(res.data.data)
        })
    }

    useEffect(()=>{
        if(m>1){
            console.log('Produktkategorien ausgegeben.')
            produktkategorienAnzeigen()
        }
    },[m])

    function pkz(){
        setrendern('shopdetails')
   }

     // Produkte des Shops
     function produktkategorieclick (z){
        console.log(z)
        setPKNr(z) 
        produkteAnzeigen()
        setrendern('produkte')
        setz((prev)=>{return prev+1})
     }

     function produkteAnzeigen(){
        console.log("Produkte ausgegeben.")
        
        let input = {
            "first": "shops",
            "second": "produkteNachProduktkatogrie",
            "ProduktkategorieID": PKNr
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            setprodukte(res.data.data)
            console.log(res.data.data)
        })
    }

    useEffect(()=>{
        if(z>1){
            console.log('Produkte ausgegeben.')
            produkteAnzeigen()
        }
    },[z])

    function pz(){
        setrendern('produktkategorien')
   }

    // Produktdetails
    function produktclick(pd){
        setrendern('produktdetails')
        console.log(pd)
        setpnr(pd)
        produktdetailsAnzeigen()
        setpd((prev)=>{return prev+1})
    }

    function produktdetailsAnzeigen(){
        console.log("Produktdetails ausgeben...")

        let input = {
            "first": "produkt",
            "second":  "produktEinsehen",
            "produktID": pnr
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            setpdetails(res.data.data)
            console.log(res.data.data)
        })
    }

    useEffect(()=>{
        if(pd>1){
            console.log('Produktdetails ausgegeben.')
            produktdetailsAnzeigen()
        }
    },[pd])

    function minusclick(){
        setp_anzahl((prev=>{
           return prev-1
        }))
      }
    
      function plusclick(){
        setp_anzahl((prev=>{
           return prev+1
        }))
      }

    function pdz(){
        setrendern('produkte')
   }
     

    //Shortcut Produkt zum Warenkorb hinzufügen
    function wkclick(wk){
        console.log("Produkt hinzufügen, bitte warten...")
        console.log(wk)
        setPKNr(wk)
        setwk((prev)=>{return prev+1})

        let input = {
            "first": "bestellung",
            "second": "produktInWarenkorb",
            "produktID": PKNr,
            "bestellmenge": p_anzahl
        }
        fetchapi('POST', input, "/kunde-functions"). then((res) =>{
            console.log(res.msg)
            if(res.data.status == true){
            console.log("Produkt dem Warenkorb hinzugefügt.")
            setperfect(res.data.msg)
        } else {
            setfehler(res.data.msg)
        }
        })
    }

    
    //Shortcut Produkt zur Wunschliste hinzufügen
    function wlclick(wl){
        console.log("Produkt hinzufügen, bitte warten...")
        console.log(wl)
        setPKNr(wl)
        setwl((prev)=>{return prev+1})

        let input = {
            "first": "produkt",
            "second": "produktInWunschliste",
            "produktID": PKNr
        }
        fetchapi('POST', input, "/kunde-functions"). then((res) =>{
            console.log(res.msg)
            if(res.data.msg == true) {
                console.log("Produkt der Wunschliste hinzugefügt.")
                setperfect(res.data.msg)
            } else {
                setfehler(res.data.msg)
            }
        })
    }

    return(
        <div>
        {rendern === 'shopkategorien' &&
        <div className="shopkategorie" style={{ marginTop: '30px', cursor:'pointer'}} >
               {shopkategorieK.map((item) => {
                    return <Card className='kategorie' key={item.shopkategorieId} onClick={()=>{shopkclick(item.shopkategorieId)}}>
                    <Card.Body>
                       <Card.Text>{item.shopkategorieName}</Card.Text>
                    </Card.Body>
              </Card>;
               })}
        </div>
        }
        {rendern === 'shops' &&
        <div>
            <div className="shopsk" style={{style, cursor: 'pointer'}}>
                <Card className='shop'>
                    <Card.Body>
                    <h4>{`${skategorie}`} </h4>
                    <p></p>             
                    {shopsk.map((item) => {
                    return <Card.Text key={item.shopkategorieId} onClick={()=>{shopclick(item.shopID)}}>{item.shopname}</Card.Text>
                    })}
                    </Card.Body>
                </Card>
        </div>
        <Button variant='info' onClick={shz}>zurück</Button>
        </div>
        }
        {rendern === 'shopdetails' &&
        <div>
            <Card className='shopdetail'>
            <div className="shopdetails">
            <p className="data">Shop-Name: <span className='data-wert-click' onClick={()=>{shopnameclick(shopdaten.ShopID)}} style={{cursor: 'pointer'}}>{shopdaten.shopname}</span></p>
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
                {shopdaten.oeffnungszeiten === 'Noch nicht definiert' ? <p>{shopdaten.oeffnungszeiten}</p> : <Offnungzeiten time={opentime} />} 
            </div>
            </div>
            </Card>
            <Button variant='info' onClick={sdz}>zurück</Button>
        </div>
        }
        {rendern === 'produktkategorien' &&
        <div>
            <Card className='produktkategorie'>
             <div className="produktkategorien" style={{style, cursor: 'pointer'}}>
            <h4>
            Produktkategorien: <Badge bg="secondary"></Badge>
            </h4>
            <p></p>
                <div className='produktkategorie-left-side'>
                {produktkategorie.map((item)=>{
                    return <Form key={item.P_KategorieID}>
                        <Row>
                            <Form.Group>
                                <Form.Label onClick={()=>{produktkategorieclick(item.P_KategorieID)}} style={{cursor: 'pointer'}}>{item.P_Kategoriename}</Form.Label>
                            </Form.Group>
                        </Row>
                    </Form>
                })}
                </div>
                <div className='produktkategorie-right-side'>
                    
                </div>
             </div> 
             </Card>
             <Button variant='info' onClick={pkz}>zurück</Button>
        </div>
        }
        {rendern === 'produkte' &&
        <div>
            <Card className='produktAnzeige' >
            <div className='produktitem'>
            <h4>
            Produkte: <Badge bg="secondary"></Badge>
            </h4>
            <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
            {produkte.map((item)=>{
                return <ProduktK key={item.ProduktID} name={item.P_Name} preis={item.Preis} beschreibung={item.Beschreibung} bild={item.Bild} produktclick={()=>{produktclick(item.ProduktID)}} wkclick={()=>{wkclick(item.ProduktID)}} wlclick={()=>{wlclick(item.ProduktID)}}>              
            </ProduktK>
            })}
            {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
            {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
            </div>
            </div>
            </Card>
            <Button variant='info' onClick={pz}>Zurück</Button>
        </div>
        }
        {rendern === 'produktdetails' &&
        <div>
            <Card className='produktdetailsCard'>
                <div className='produktDetails'>
            <h5>Produktdetails:</h5>
            <p>{pdetails.ShopName}</p>
            <div className='bild'>
                <img variant="top" src={pdetails.Bild} alt='foto'/>
            </div>
            <div className='produktdetails'>
                <h3>{pdetails.P_Name}</h3>
                <h5>Preis: {pdetails.Preis}€</h5>
                <p>Marke: {pdetails.Marke}</p>
                <p>Material: {pdetails.Material}</p>
                <p>Umsatzsteuer: {pdetails.Umsatzsteuer}%</p>
                <p>Stückzahl: {pdetails.Stückzahl}</p>
                <p>Beschreibung: {pdetails.Beschreibung}</p>
            </div>
            <div className='right-side'>
            <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
                <Card className='produktCard' >
                    <Card.Body>
                        <Card.Title>Preis: {pdetails.Preis}€</Card.Title>
                        <Card.Text>Menge: <div className='mengeAendern' style={{display:'flex',alignItems:'center', justifyContent:'center'}}>
                        <AiFillMinusCircle onClick={minusclick} style={{cursor:'pointer'}}></AiFillMinusCircle>
                        <h4>{p_anzahl}</h4>
                        <AiFillPlusCircle onClick={plusclick} style={{cursor:'pointer'}}></AiFillPlusCircle> 
                        </div></Card.Text>
                        <Button className='warenkorbButton' variant='success' onClick={()=>{wkclick(pdetails.ProduktID)}}>In den Warenkorb</Button>
                        <Button variant='primary' onClick={()=>{wlclick(pdetails.ProduktID)}}>Auf die Wunschliste</Button>
                        {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
                        {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                    </Card.Body>
                </Card>
                </div>
            </div>
            </div>
            </Card>
            <Button className='zurückButton' variant='info' onClick={pdz}>Zurück</Button>
        </div>
        }
        {section!== '' && 
        <Section name={`${section}:`}> 
        </Section>
        }
        </div>
    )
}

export default KundeShops;