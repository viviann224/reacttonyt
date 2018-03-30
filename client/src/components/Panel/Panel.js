import React from 'react';
import "./Panel.css";
export const Panel = (props) => (
  <div className="panel panel-primary" {...props}>
    {props.children}
  </div>
)
