import React from 'react';
import ReactDOM from 'react-dom';
import { onMessageFromPopup, sendMessageToPopup, MessageLocation } from '@wbet/message-api';
import root from 'react-shadow/styled-components';
import Vera from './Vera';
import { EVENTS } from '../../common';
import { getVideoPlayer } from './Vera/hooks/utils';



const PanelID = 'PORTAL_VERA_PANEL';
console.log('index.ext exe');
let panel = document.createElement('aside');
panel.id = PanelID;
document.body.appendChild(panel);
ReactDOM.render(<root.div><Vera /></root.div>, document.getElementById(PanelID));

onMessageFromPopup(MessageLocation.Content, {
  [EVENTS.VIDEO_PAGE]: () => {
    let video = getVideoPlayer();
    sendMessageToPopup({ video_page: !!video }, MessageLocation.Content, EVENTS.VIDEO_PAGE)
  }
})
