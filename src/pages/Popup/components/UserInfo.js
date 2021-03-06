import React from 'react'
import styled from 'styled-components';
const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:16px 24px;
  border-bottom: 1px solid #C4C4C4;
  .info{
    display: flex;
    align-items: center;
    gap:10px ;
    .avator{
      width:36px;
      height:36px;
      border-radius: 50%;
      border:2px solid var(--theme-color);
      padding:2px;
      img{
        border-radius: 50%;
        width:100%;
        height:100%;
      }
    }
    .username{
      color:#000;
      font-size: 16px;
      line-height: 22px;
    }
  }
  .logout{
    cursor: pointer;
    background:none;
    border-radius: 15px;
    border:1px solid #616161;
    color:#616161;
    padding:2px 15px;
    font-size: 12px;
    line-height: 22px;
  }
`;
export default function UserInfo({ user, logout }) {
  const handleLogout = () => {
    logout()
  }
  if (!user) return null;
  const { id, username, photo } = user;
  return (
    <StyledWrapper>
      <div className="info" data-id={id}>
        <div className="avator">
          <img src={photo || "https://files.authing.co/authing-console/default-user-avatar.png"} alt="user avator" />
        </div>
        <span className="username">{username}</span>
      </div>
      <button onClick={handleLogout} className="logout">Log out</button>
    </StyledWrapper>
  )
}
