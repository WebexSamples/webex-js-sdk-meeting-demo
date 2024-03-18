const rootElement = document.getElementById('root');
const joinWithMediaBtn = document.getElementById('join-with-media');
const leaveMeetingBtn = document.getElementById('leave-meeting');

// Media elements
const remoteVideoStreamElm = document.getElementById('remote-video');
const remoteAudioStreamElm = document.getElementById('remote-audio');
const localVideoStreamElm = document.getElementById('local-video');
const localAudioStreamElm = document.getElementById('local-audio');

import { meetingInfo, guestEndpointUrl } from './meeting-info.js';

let webex = null;
let createdMeeting = null;
let localStream = null;

let vbgEffect = null;
let bnrEffect = null;

rootElement.addEventListener('click', async (e) => {
  switch (e.target.id) {
    case 'join-with-media':
      await joinMeeting();
      break;
    case 'toggle-vbg-btn':
      await toggleVBG();
      break;
    case 'leave-meeting':
      await leaveMeeting();
      break;

    default:
      break;
  }

  e.stopPropagation();
});

const guestUrl = 'https://webexapis.com/v1/guests/token';

// Via Service App
async function getGuestAccessTokenV2() {
  const response = await fetch(guestUrl, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${guestIssuerAccessToken}`,
    },
    body: JSON.stringify({
      subject: 'Guest token for Webex SDK Sample App',
      displayName: 'Guest User',
    }),
  });

  const data = await response.json();

  return data.accessToken;
}

async function getGuestAccessToken() {
  // Create the end point using guest issuer
  const response = await fetch(guestEndpointUrl, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Guest User',
    }),
  });

  const data = await response.json();

  return data.body.token;
}

async function initWebexAndRegisterDevice(access_token) {
  if (!access_token) {
    alert('Please provide an access token');
    return;
  }

  webex = window.webex = Webex.init({
    credentials: {
      access_token,
    },
  });

  await webex.meetings.register();
}

async function createMeeting() {
  // MeetingInfo object being referenced from meeting-info.js
  const meeting = await webex.meetings.create(meetingInfo.sipAddress);

  createdMeeting = meeting;
}

function setMediaListeners() {
  // Wait for media in order to show video
  createdMeeting.on('media:ready', (media) => {
    console.log('Media ready', media);
    switch (media.type) {
      case 'remoteVideo':
        remoteVideoStreamElm.srcObject = media.stream;
        break;
      case 'remoteAudio':
        remoteAudioStreamElm.srcObject = media.stream;
        break;
    }
  });

  // Remove stream if media stopped
  createdMeeting.on('media:stopped', (media) => {
    switch (media.type) {
      case 'remoteVideo':
        remoteVideoStreamElm.srcObject = null;
        break;
      case 'remoteAudio':
        remoteAudioStreamElm.srcObject = null;
        break;
    }
  });
}

async function getLocalStreams() {
  const microphoneStream = await webex.meetings.mediaHelpers.createMicrophoneStream({ audio: true });

  const cameraStream = await webex.meetings.mediaHelpers.createCameraStream({ video: true, width: 640, height: 480 });
  localVideoStreamElm.srcObject = cameraStream.outputStream;

  return {
    microphone: microphoneStream,
    camera: cameraStream,
  };
}

async function joinMeetingWithMedia(localStreams) {
  const meetingOptions = {
    mediaOptions: {
      allowMediaInLobby: true,
      localStreams,
    },
  };

  const { isPasswordValid } = await createdMeeting.verifyPassword(meetingInfo.password);

  if (!isPasswordValid) {
    console.error('Invalid meeting password');
    return;
  }

  await createdMeeting.joinWithMedia(meetingOptions);

  leaveMeetingBtn.style.display = 'inline';
  joinWithMediaBtn.style.display = 'none';
}

async function leaveMeeting() {
  leaveMeetingBtn.innerHTML = 'Leaving...';
  leaveMeetingBtn.disabled = true;

  await createdMeeting.leave();
  reset();
}

function reset() {
  // Join meeting button
  joinWithMediaBtn.style.display = 'block';
  joinWithMediaBtn.innerHTML = '<img class="control-icon" src="images/controls/join-meeting.png" />';
  joinWithMediaBtn.disabled = false;
  joinWithMediaBtn.style.backgroundColor = '#59b15d';
  joinWithMediaBtn.style.cursor = 'pointer';

  // Leave meeting button
  leaveMeetingBtn.style.display = 'none';
  leaveMeetingBtn.innerHTML = '<img class="control-icon" src="images/call.png" />';
  leaveMeetingBtn.disabled = true;

  cleanUpMedia();
  createdMeeting = null;
}

function cleanUpMedia() {
  // local streams can be used across meetings
  [localAudioStreamElm, localVideoStreamElm, remoteVideoStreamElm, remoteAudioStreamElm].forEach((elem) => {
    if (elem.srcObject) {
      try {
        elem.srcObject.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.log('Cleanup media error: ', error);
      } finally {
        elem.srcObject = null;
      }
    }
  });
}

async function joinMeeting() {
  joinWithMediaBtn.innerText = 'Joining...';
  joinWithMediaBtn.disabled = true;
  joinWithMediaBtn.style.backgroundColor = 'grey';
  joinWithMediaBtn.style.cursor = 'default';

  try {
    // Step-1
    // const accessToken = await getGuestAccessToken();
    const accessToken = await getGuestAccessTokenV2();

    // Step-2
    await initWebexAndRegisterDevice(accessToken);

    // Step-3
    await createMeeting();

    // Step-4
    setMediaListeners();

    // Step-5
    localStream = await getLocalStreams();

    // Step-6
    await joinMeetingWithMedia(localStream);
  } catch (error) {
    console.error('Error joining meeting', error);
    reset();
  }
}

let isVBGEnabled = false;
async function toggleVBG() {
  if (!vbgEffect) {
    vbgEffect = await webex.meetings.createVirtualBackgroundEffect({
      mode: 'IMAGE', // options are 'BLUR', 'IMAGE', 'VIDEO'
      bgImageUrl: vbgImageUrl,
      // bgVideoUrl: blurVBGVideoUrl,
    });
  }

  await localStream.camera.addEffect(vbgEffect);

  if (isVBGEnabled) {
    await vbgEffect.disable();
    isVBGEnabled = false;
  } else {
    await vbgEffect.enable();
    isVBGEnabled = true;
  }
}

async function addBNR() {
  bnrEffect = await webex.meetings.createNoiseReductionEffect();
  await localStream.microphone.addEffect(bnrEffect);
  await bnrEffect.enable();
}

async function disableBNR() {
  await bnrEffect.disable();
}
