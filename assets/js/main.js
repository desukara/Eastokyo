"use strict";

const GOOGLE_ANALYTICS_ID = "G-KR8C4FRGRB";

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){
  window.dataLayer.push(arguments);
};

window.gtag("js", new Date());
window.gtag("config", GOOGLE_ANALYTICS_ID);

const analyticsScript = document.createElement("script");
analyticsScript.async = true;
analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
document.head.appendChild(analyticsScript);

import "./navigation.js";
import "./page-transitions.js";
import "./reading-progress.js";
import "./share.js";
