const rootElement = document.getElementById('root');
const joinWithMediaBtn = document.getElementById('join-with-media');
const leaveMeetingBtn = document.getElementById('leave-meeting');
const toggleAudioBtn = document.getElementById('toggle-audio-btn');
const toggleVideoBtn = document.getElementById('toggle-video-btn');
const toggleScreenShareBtn = document.getElementById('toggle-screen-share-btn');

// Media elements
const remoteVideoStreamElm = document.getElementById('remote-video');
const remoteAudioStreamElm = document.getElementById('remote-audio');
const localVideoStreamElm = document.getElementById('local-video');
const localAudioStreamElm = document.getElementById('local-audio');

import { meetingInfo, guestEndpointUrl } from './meeting-info.js';

let webex = null;
let createdMeeting = null;



rootElement.addEventListener('click', async (e) => {
  switch (e.target.id) {
    case 'join-with-media':
      await joinMeeting();
      break;
    case 'leave-meeting':
      await leaveMeeting();
      break;
      case 'toggle-audio-btn':
        toggleText(e.target, ['mute', 'unmute']);
        break;
      case 'toggle-video-btn':
        toggleText(e.target, ['video-on', 'video-off']);
        break;
      case 'toggle-screen-share-btn':
        toggleText(e.target, ['start-sharing', 'stop-sharing']);
        break;

    default:
      break;
  }

  e.stopPropagation();
});

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

  leaveMeetingBtn.style.display = 'block';
  joinWithMediaBtn.style.display = 'none';
}

async function leaveMeeting() {
  leaveMeetingBtn.innerText = 'Leaving...';
  leaveMeetingBtn.disabled = true;

  await createdMeeting.leave();
  reset();
}

function reset() {
  // Join meeting button
  joinWithMediaBtn.style.display = 'block';
  joinWithMediaBtn.innerText = 'Join meeting';
  joinWithMediaBtn.disabled = false;
  joinWithMediaBtn.style.backgroundColor = '#007bff';
  joinWithMediaBtn.style.cursor = 'pointer';

  // Leave meeting button
  leaveMeetingBtn.style.display = 'none';
  leaveMeetingBtn.innerText = 'Leave meeting';
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
    const accessToken = await getGuestAccessToken();

    // Step-2
    await initWebexAndRegisterDevice(accessToken);

    // Step-3
    await createMeeting();

    // Step-4
    setMediaListeners();

    // Step-5
    const localStream = await getLocalStreams();

    // Step-6
    await joinMeetingWithMedia(localStream);
  } catch (error) {
    console.error('Error joining meeting', error);
    reset();
  }
}


function toggleAudio() {
}

function toggleVideo() {}

function toggleScreenShare() {}

function enableVBG() {}


function toggleText (element, [text1, text2]) {

  const srcText= element.childNodes[1].src;
  const isExistingSrc= srcText.includes(`/${text1}`);
  element.childNodes[1].src = isExistingSrc ? srcText.replace(`/${text1}`, `/${text2}`):srcText.replace(`/${text2}`, `/${text1}`);
};
