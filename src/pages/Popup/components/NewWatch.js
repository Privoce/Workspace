import { useState, useEffect } from 'react'
import styled from 'styled-components';
// import StyledBlock from './StyledBlock'
import { sendMessageToContentScript, sendMessageToBackground, MessageLocation, onMessageFromContentScript } from '@wbet/message-api'
import { EVENTS } from '../../../common'

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding:16px 20px;
  .block{
    width: 100%;
    width:-webkit-fill-available;
    display: flex;
    flex-direction: column;
    gap:12px;
    background: #fff;
    border-radius: 5px;
    padding:12px 14px;
    .start{
      cursor: pointer;
      align-self: center;
      border:none;
      background: linear-gradient(92.68deg, #68D6DD 8.39%, #A700C5 122.69%);
      border-radius: 20px;
      padding:8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      .txt{
        color:#fff;
        font-size: 14px;
        line-height: 22px;
      }
      .icon{
        width: 20px;
      }

    }
    .tip{
      border: 0.5px solid var(--theme-color);
      border-radius: 10px;
      padding:8px 8px 8px 46px;
      font-weight: 600;
      font-size: 14px;
      line-height: 22px;
      color: var(--theme-color);
      background-image: url('https://static.nicegoodthings.com/works/vera/popup.vera.info.png');
      background-size: 20px;
      background-repeat: no-repeat;
      background-position:17.5px 9.5px ;
    }
    .link{
      text-align: center;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
      line-height: 22px;
      color: #606368;
      &:hover{
        color: var(--theme-color);
      }
    }
  }
`;
export default function NewWatch() {
  const [video, setVideo] = useState(undefined)
  useEffect(() => {
    onMessageFromContentScript(MessageLocation.Popup, {
      [EVENTS.VIDEO_PAGE]: ({ video_page = false }) => {
        setVideo(video_page)
      }
    });
    chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
      if (!tab.url.startsWith('http')) {
        setVideo(false);
        return;
      }
      sendMessageToContentScript(tab.id, {}, MessageLocation.Popup, EVENTS.VIDEO_PAGE)
    });
  }, [])
  const handleNewBrowsing = () => {
    sendMessageToBackground({}, MessageLocation.Popup, EVENTS.NEW_MEETING);
    window.close()
  }
  if (typeof video == 'undefined') return null;
  return (
    <StyledWrapper>
      <div className="block">
        <button onClick={handleNewBrowsing} className="start">
          <img src="https://static.nicegoodthings.com/works/vera/vera.logo.white.png" alt="vera icon" className="icon" />
          <span className="txt">{video ? 'Start a New Cowatching Session' : 'Start a New Cobrowsing Session'}</span>
        </button>
        {!video && <div className="tip">To start a new cowatching session, please reopen Vera on a video’s page.</div>}

        <a href="https://webrow.se/vera/#howto" target="_blank" className="link">Learn How It Works</a>
      </div>
    </StyledWrapper>
  )
}
