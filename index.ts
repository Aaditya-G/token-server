import express from "express";
import dotenv from "dotenv";
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from "agora-access-token";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const nocache = (req: express.Request, resp: express.Response, next: express.NextFunction) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}


const generateRTCToken = (req: express.Request, resp: express.Response) => {
  resp.header('Acess-Control-Allow-Origin', '*');
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }
  let expireTime
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    try {
      expireTime = parseInt(req.query.expiry as string, 10);
    } catch (e) {
      return resp.status(500).json({ 'error': 'expiry is incorrect ' + JSON.stringify(e) });
    }
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  } else if (req.params.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, parseInt(uid, 10), role, privilegeExpireTime);
  } else {
    return resp.status(500).json({ 'error': 'token type is invalid' });
  }
  return resp.json({ 'rtcToken': token });
}

const generateRTMToken = (req: express.Request, resp: express.Response) => {
  resp.header('Acess-Control-Allow-Origin', '*');
  let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  let role = RtmRole.Rtm_User;
  let expireTime
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    try {
      expireTime = parseInt(req.query.expiry as string, 10);
    } catch (e) {
      return resp.status(500).json({ 'error': 'expiry is incorrect ' + JSON.stringify(e) });
    }
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime)
  const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  return resp.json({ 'rtmToken': token });
}

const generateRTEToken = (req: express.Request, resp: express.Response) => {
  resp.header('Acess-Control-Allow-Origin', '*');
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }
  let expireTime
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    try {
      expireTime = parseInt(req.query.expiry as string, 10);
    } catch (e) {
      return resp.status(500).json({ 'error': 'expiry is incorrect ' + JSON.stringify(e) });
    }
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, parseInt(uid, 10), role, privilegeExpireTime);
  const rtmToken = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  return resp.json({ 'rtcToken': rtcToken, 'rtmToken': rtmToken });
}

app.get('/rtc/:channel/:role/:tokentype/:uid', nocache , generateRTCToken);
app.get('/rtm/:uid/', nocache , generateRTMToken);
app.get('/rte/:channel/:role/:tokentype/:uid', nocache , generateRTEToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});