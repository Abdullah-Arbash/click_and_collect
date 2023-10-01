import React, { useEffect, useState } from 'react';
import '../../css/navk.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BsPersonCheckFill } from "react-icons/bs";
import {BsSuitHeart} from "react-icons/bs";
import {BsFillBasket2Fill} from "react-icons/bs";
import { Button } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import { useNavigate } from 'react-router-dom';
import '../../css/kunde.css';


function NavK(props) {

  const navigate = useNavigate();

  const [suchwort, setsuchwort] = useState({suchfeld:''});
  const [produktsuche, setproduktsuche] = useState('');
  const [shopsuche, setshopsuche] = useState('');

  function kundesearch(event){
    console.log(event.target.value)
    setsuchwort((prev)=>{return {...prev,[event.target.name]:event.target.value}})
  }

  // Produktsuche
  function kundeProduktsuche(){
    console.log('Produktsuche')
    console.log(suchwort.suchfeld)
    let input = {
      "first": "produkt",
      "second": "suchfeld",
      "suchfeld": suchwort.suchfeld,
      "suchkategorie": "Produkte"
    }
    fetchapi('POST', input, '/kunde-functions').then((res) =>{
      console.log(res)
      if (res.data.data.length === 0) {
        props.keinergebnis(res.data.msg)
      } else {
        setproduktsuche(res.data.data)
        props.psuche(res.data.data)
        console.log(res.data.data)
      }
    })
  }

  useEffect(()=>{
    console.log('Produktsuche hat das Ergebnis ausgegeben.')
  },[])

  // Shopsuche
  function kundeShopsuche(){
    console.log('Shopsuche')
    console.log(suchwort.suchfeld)
    let input = {
      "first": "produkt",
      "second": "suchfeld",
      "suchfeld": suchwort.suchfeld,
      "suchkategorie": "Shops"
    }
    fetchapi('POST', input, '/kunde-functions').then((res) =>{
      console.log(res)
      if(res.data.data.length === 0) {
        props.keinergebnis(res.data.msg)
      } else {
        setshopsuche(res.data.data)
        props.ssuche(res.data.data)
        console.log(res.data.data)
      }
    })
  }

  useEffect(()=>{
    console.log('Shopsuche hat das Ergebnis ausgegeben.') 
  },[])


    return ( 
        <nav className='navk'>     
          <Navbar bg="light" expand="lg">
            <Container>
            <Navbar.Brand><img src='imges/logo.png' alt='logo' onClick={props.logoclick} className='LogoNavk'/></Navbar.Brand>
                <div className="searchBar">
                    <input type="text" placeholder="Suche ..." name='suchfeld' value={suchwort.suchfeld} onChange={(event) => kundesearch(event)} style={{height:'40px', borderRadius:'7px', marginRight:'5px'}}/>
                    <NavDropdown title={'Kategorie'} variant="secondary">
                    <NavDropdown.Item onClick={(event) => kundeProduktsuche(event)}>Produkte</NavDropdown.Item>
                    <NavDropdown.Item onClick={(event) => kundeShopsuche(event)}>Shops</NavDropdown.Item>
                    </NavDropdown>
                </div>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto anzeigen">
                  <div className='WK_WL-buttons'>
                    <div className='nav-icon-kunde'>
                    <BsFillBasket2Fill style={{color:'green',fontSize:'21px', marginRight: '0.5rem'}}/>
                    <Button variant="primary" onClick={props.warenkorbklick}>Warenkorb</Button>
                    </div>
                    <p></p>
                    <div className='nav-icon2-kunde'>
                    <BsSuitHeart style={{color:'red', fontSize:'21px', marginRight: '0.5rem'}}/> 
                    <Button variant="primary" onClick={props.wunschlisteklick}>Wunschliste</Button>
                    </div>
                  </div>
                  
                  <div className='drop-down'>
                  < BsPersonCheckFill style={{color:'blue',fontSize:'25px'}}/>
                  <NavDropdown title={`Rolle: ${props.rolle}`} id="basic-nav-dropdown">
                    <NavDropdown.Item onClick={props.profilclick}>Profil</NavDropdown.Item>
                    <NavDropdown.Item onClick={props.abholscheineclick}>Abholscheine</NavDropdown.Item>
                    <NavDropdown.Item onClick={props.rechnungenclick}>Rechnungen</NavDropdown.Item>
                    <NavDropdown.Item onClick={props.logoutclick}>Logout</NavDropdown.Item>
                  </NavDropdown>
                  </div>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </nav>
   );
}

export default NavK;