const EVENTS = {
  // 断开websocket连接
  DISCONNECT_SOCKET: 'DISCONNECT_SOCKET',
  // 初始化websocket连接
  ROOM_SOCKET_INIT: 'ROOM_SOCKET_INIT',
  // 发送websocket消息
  SOCKET_MSG: 'SOCKET_MSG',
  // 打开主页
  OPEN_HOME: 'OPEN_HOME',
  // 登录
  LOGIN: 'LOGIN',
  // 退出
  LOGOUT: 'LOGOUT',
  // POPUP页面数据
  POP_UP_DATA: 'POP_UP_DATA',
}
// const SOCKET_SERVER_DOMAIN = 'stage.vera.nicegoodthings.com';
const SOCKET_SERVER_DOMAIN = 'vera.nicegoodthings.com';
// const SOCKET_SERVER_DOMAIN = 'localhost:4000';
export { EVENTS, SOCKET_SERVER_DOMAIN }
