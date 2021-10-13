import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { sendMessageToBackground, onMessageFromBackground, MessageLocation } from '@wbet/message-api'

import { getUser } from './hooks/utils';
import { EVENTS } from '../../../common';
const CssVars = `
      --workspace-theme-color:#A700C5;
      .workspace-dark-theme{
        --workspace-theme-color:#85d4db;
      }
`;
const StyledWrapper = styled.section`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999999;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  ${CssVars}
`;


export default function Workspace() {

  return (
    <StyledWrapper id="WORKSPACE_FULLSCREEN_CONTAINER">
      workspace content
    </StyledWrapper>
  );
}

