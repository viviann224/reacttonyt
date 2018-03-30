import React from 'react';
import "./Panel.css";

export const PanelHeading = (props) => (
  <div className="panel-heading clearfix" {...props}>
    {props.children}
  </div>
)
