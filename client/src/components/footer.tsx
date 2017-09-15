import * as React from 'react';
import { Link } from 'react-router';

export const Footer: React.StatelessComponent<{}> = () => {
  return (
    <div className="footer">
      <div className="col-xs-12 col-md-4 footer_left">
        <Link to="/about">ABOUT</Link>
        <Link to="/donate">DONATE</Link>
        <a href="https://nsheremet.pw/">BLOG</a>
        <a href="https://nsheremet.pw/projects/">PROJECTS</a>

      </div>
      <div className="col-xs-12 col-md-4 text-center">
        <img className="footer_logo" src="/site/img/logo_footer.png" alt="8lnk.pw - Logo"/>
      </div>
      <div className="col-xs-12 col-md-3 col-md-offset-1">
        <p>COPYRIGHT © 2017</p>
        <p>NAZARII SHEREMET.</p>
        <br/>
        <p>PROUDLY MADE IN KYIV</p>
      </div>
      <div className="col-xs-12 text-center">
        <p>80,304 LINKS PROCESSED</p>
      </div>
    </div>
  )
}