import React from 'react';
import '../css/navm.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BsPersonCheckFill } from "react-icons/bs";



function NavM(props) {

    return ( 
          <nav className='navm'>     
            <Navbar bg="light" expand="lg">
              <Container>
              <Navbar.Brand style={{cursor:'pointer'}}><img src='imges/logo.png' alt='logo' onClick={props.x} /></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto anzeigen">
                    <div className='nav-name'>
                      <p>{props.geschäftname}</p>
                      <p>{props.name}</p>
                    </div>
                    
                    <div className='drop-down'>
                    < BsPersonCheckFill style={{color:'blue',fontSize:'21px' }}/>
                    <NavDropdown title={`Rolle: ${props.rolle}`} id="basic-nav-dropdown">
                      <NavDropdown.Item onClick={props.profilclick}>Profil</NavDropdown.Item>
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

export default NavM;