const rootElement = document.getElementById("root");
const joinWithMediaBtn = document.getElementById("join-with-media");
const leaveMeetingBtn = document.getElementById("leave-meeting");
const toggleVBGBtn = document.getElementById("toggle-vbg-btn");

// Media elements
const remoteVideoStreamElm = document.getElementById("remote-video");
const remoteAudioStreamElm = document.getElementById("remote-audio");
const localVideoStreamElm = document.getElementById("local-video");
const localAudioStreamElm = document.getElementById("local-audio");

const MEETING_PASSWORD_REQUIRED = "REQUIRED";

import {
  meetingInfo,
  vbgImageUrl,
  guestIssuerAccessToken,
  personalAccessToken,
} from "./meeting-info.js";

let webex = null;
let createdMeeting = null;
let localStream = null;

let vbgEffect = null;
let isVBGEnabled = false;

rootElement.addEventListener("click", async (e) => {
  switch (e.target.id) {
    case "join-with-media":
      await joinMeeting();
      break;

    case "toggle-vbg-btn":
      await toggleVBG();
      break;

    case "leave-meeting":
      await leaveMeeting();
      break;

    default:
      break;
  }

  e.stopPropagation();
});

const guestUrl = "https://webexapis.com/v1/guests/token";

// Via Service App
async function getGuestAccessToken() {
  const response = await fetch(guestUrl, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${guestIssuerAccessToken}`,
    },
    body: JSON.stringify({
      subject: "Guest token for Webex SDK Sample App",
      displayName: "Guest User",
    }),
  });

  const data = await response.json();

  return data.accessToken;
}

async function initWebexAndRegisterDevice(access_token) {
  if (!access_token) {
    alert("Please provide an access token");
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
  createdMeeting.on("media:ready", (media) => {
    console.log("Media ready", media);
    switch (media.type) {
      case "remoteVideo":
        remoteVideoStreamElm.srcObject = media.stream;
        break;
      case "remoteAudio":
        remoteAudioStreamElm.srcObject = media.stream;
        break;
    }
  });

  // Remove stream if media stopped
  createdMeeting.on("media:stopped", (media) => {
    switch (media.type) {
      case "remoteVideo":
        remoteVideoStreamElm.srcObject = null;
        break;
      case "remoteAudio":
        remoteAudioStreamElm.srcObject = null;
        break;
    }
  });
}

async function getLocalStreams() {
  // https://github.com/webex/webex-js-sdk/wiki/Streams-and-Effects
  const microphoneStream =
    await webex.meetings.mediaHelpers.createMicrophoneStream({
      echoCancellation: true,
      noiseSuppression: true,
    });

  const cameraStream = await webex.meetings.mediaHelpers.createCameraStream({
    width: 640,
    height: 480,
  }); // Optional params
  localVideoStreamElm.srcObject = cameraStream.outputStream;

  return {
    microphone: microphoneStream,
    camera: cameraStream,
  };
}

async function verifyPassword() {
  const { isPasswordValid } = await createdMeeting.verifyPassword(
    meetingInfo.password,
  );

  if (!isPasswordValid) {
    console.error("Invalid meeting password");

    throw new Error("Invalid meeting password");
  }
}

async function joinMeetingWithMedia(localStreams) {
  const meetingOptions = {
    mediaOptions: {
      allowMediaInLobby: true,
      localStreams,
    },
  };

  await createdMeeting.joinWithMedia(meetingOptions);

  leaveMeetingBtn.style.display = "inline";
  joinWithMediaBtn.style.display = "none";
}

async function leaveMeeting() {
  leaveMeetingBtn.innerHTML = "Leaving...";
  leaveMeetingBtn.disabled = true;

  await createdMeeting.leave();
  reset();
}

export async function joinMeeting() {
  joinWithMediaBtn.innerHTML = "Joining...";
  joinWithMediaBtn.disabled = true;
  joinWithMediaBtn.style.backgroundColor = "grey";
  joinWithMediaBtn.style.cursor = "default";

  try {
    // Step-1
    let accessToken;

    if (guestIssuerAccessToken) {
      accessToken = await getGuestAccessToken();
    } else {
      accessToken = personalAccessToken;
    }

    // Step-2
    await initWebexAndRegisterDevice(accessToken);

    // Step-3
    await createMeeting();

    // Step-4
    setMediaListeners();

    // Step-5
    localStream = await getLocalStreams();

    // Step-6
    // Enable only if meeting is password protected.
    if (createdMeeting.passwordStatus === MEETING_PASSWORD_REQUIRED) {
      await verifyPassword();
    }

    // Step-7
    await joinMeetingWithMedia(localStream);
  } catch (error) {
    console.error("Error joining meeting", error);
    reset();
  }
}

async function toggleVBG() {
  toggleVBGBtn.innerText = "Toggling...";

  if (!vbgEffect) {
    vbgEffect = await webex.meetings.createVirtualBackgroundEffect({
      mode: "IMAGE", // options are 'BLUR', 'IMAGE', 'VIDEO'
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

  toggleVBGBtn.innerText = "Toggle VBG";
}

async function addBNR() {
  bnrEffect = await webex.meetings.createNoiseReductionEffect();
  await localStream.microphone.addEffect(bnrEffect);
  await bnrEffect.enable();
}

async function disableBNR() {
  await bnrEffect.disable();
}

function reset() {
  // Join meeting button
  joinWithMediaBtn.style.display = "block";
  joinWithMediaBtn.innerHTML = "Join";
  joinWithMediaBtn.disabled = false;
  joinWithMediaBtn.style.backgroundColor = "#59b15d";
  joinWithMediaBtn.style.cursor = "pointer";

  // Leave meeting button
  leaveMeetingBtn.style.display = "none";
  leaveMeetingBtn.innerHTML = "Leave";
  leaveMeetingBtn.disabled = false;

  cleanUpMedia();
  createdMeeting = null;
}

function cleanUpMedia() {
  // local streams can be used across meetings
  [
    localAudioStreamElm,
    localVideoStreamElm,
    remoteVideoStreamElm,
    remoteAudioStreamElm,
  ].forEach((elem) => {
    if (elem.srcObject) {
      try {
        elem.srcObject.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.log("Cleanup media error: ", error);
      } finally {
        elem.srcObject = null;
      }
    }
  });
}
