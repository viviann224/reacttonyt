import React from "react";
import "./Nav.css";

const Nav = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top ">
    <div className="container-fluid">
      <div className="navbar-header">
        
        <a href="/" className="navbar-brand ">
          React to New York Times
        </a>
        <a className="navbar-brand" href="/savedArticles">Saved Articles</a>
      </div>
    </div>
  </nav>
);

export default Nav;
