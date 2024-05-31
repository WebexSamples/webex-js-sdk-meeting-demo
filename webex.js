import {
  meetingInfo,
  vbgImageUrl,
  guestIssuerAccessToken,
  personalAccessToken,
} from "./meeting-info.js";

// Constants
const MEETING_PASSWORD_REQUIRED = "REQUIRED";
const GUEST_URL = "https://webexapis.com/v1/guests/token";

// DOM Elements
const rootElement = document.getElementById("root");
const joinWithMediaBtn = document.getElementById("join-with-media");
const leaveMeetingBtn = document.getElementById("leave-meeting");
const toggleVBGBtn = document.getElementById("toggle-vbg-btn");
const remoteVideoStreamElm = document.getElementById("remote-video");
const remoteAudioStreamElm = document.getElementById("remote-audio");
const localVideoStreamElm = document.getElementById("local-video");
const localAudioStreamElm = document.getElementById("local-audio");

// Variables
let webex = null;
let createdMeeting = null;
let localStream = null;
let vbgEffect = null;
let isVBGEnabled = false;


// Event Listeners
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

// Functions

/**
 * Create a Guest User and returns their access token
 * 
 * @returns {Promise<string>} - Guest Access Token
 */
async function getGuestAccessToken() {
  const response = await fetch(GUEST_URL, {
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

/**
 * Initialize Webex SDK and register the device (browser)
 *
 * @param {string} access_token - Access token to authenticate the user
 * @returns {Promise<void>}
 */
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

/**
 * Create a meeting and store it in the createdMeeting variable
 */
async function createMeeting() {
  // MeetingInfo object being referenced from meeting-info.js
  const meeting = await webex.meetings.create(meetingInfo.sipAddress);

  createdMeeting = meeting;
}

/**
 * Set media listeners to show remote video and audio
 * 
 * @returns {void}
 */
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

/**
 * Get local streams for microphone and camera
 * 
 * @returns {Promise<{microphone: MediaStream, camera: MediaStream}>}
 */
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

/**
 * Verify the meeting password
 * 
 * @returns {Promise<void>}
 * @throws {Error} - If the password is invalid
 */
async function verifyPassword() {
  const { isPasswordValid } = await createdMeeting.verifyPassword(
    meetingInfo.password,
  );

  if (!isPasswordValid) {
    console.error("Invalid meeting password");

    throw new Error("Invalid meeting password");
  }
}

/**
 * Join the meeting with media
 * 
 * @param {{microphone: MediaStream, camera: MediaStream}} localStreams - Local streams for microphone and camera
 * @returns {Promise<void>}
 */
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

/**
 * Leave the meeting
 * 
 * @returns {Promise<void>}
 */
async function leaveMeeting() {
  leaveMeetingBtn.innerHTML = "Leaving...";
  leaveMeetingBtn.disabled = true;

  await createdMeeting.leave();
  reset();
}

/**
 * Main function to join the meeting
 * 
 * @returns {Promise<void>}
 */
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

/**
 * Toggle the Virtual Background
 * 
 * @returns {Promise<void>}
 */
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

/**
 * Add Background Noise Reduction effect
 * 
 * @returns {Promise<void>}
 */
async function addBNR() {
  bnrEffect = await webex.meetings.createNoiseReductionEffect();
  await localStream.microphone.addEffect(bnrEffect);
  await bnrEffect.enable();
}

/**
 * Disable Background Noise Reduction effect
 * 
 * @returns {Promise<void>}
 */
async function disableBNR() {
  await bnrEffect.disable();
}

/**
 * Reset the UI and cleanup media
 */
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

/**
 * Clean up media streams
 */
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
