import React from 'react';
import styled from 'styled-components';
import { sendMessageToBackground, MessageLocation } from '@wbet/message-api'
import { EVENTS } from '../../../common'

const StyledWrapper = styled.div`
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding:16px 16px 35px 16px;
  .wrapper{
    display: flex;
    gap: 8px;
    .col{
      flex:1;
      &.left{
        width: 150px;
      }
      &.right{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .desc{
          font-size: 16px;
          line-height: 22px;
          color:#313131;
          width: 192px;
          text-align: center;
        }
        .login{
          cursor: pointer;
          color:#fff;
          border:none;
          background: var(--theme-color);
          border-radius: 10px;
          padding:8px 16px;
          font-size: 16px;
          line-height: 22px;
        }
      }
    }
  }
  .title{
    margin: 0;
    font-size: 20px;
    line-height: 25px;
    color: var(--theme-color);
    padding-left: 40px;
    background-image: url('https://static.nicegoodthings.com/works/vera/popup.vera.logo.png');
    background-size: 32px 28px;
    background-repeat: no-repeat;
    background-position: 0;
  }

`;
export default function Login() {
  const handleLogin = () => {
    sendMessageToBackground({}, MessageLocation.Popup, EVENTS.LOGIN)
  }
  return (
    <StyledWrapper>
      <h2 className="title">Vera</h2>
      <div className="wrapper">

        <img className="col left" src="https://static.nicegoodthings.com/works/vera/popup.vera.cowatch.png" alt="co-watching" />
        <div className="col right">

          <p className="desc">Log in to Vera to watch videos together with your friends!</p>
          <button onClick={handleLogin} className="login">Log in</button>
        </div>
      </div>
    </StyledWrapper>
  )
}
