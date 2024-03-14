function openModal() {
  const body = document.getElementById("#body");
  body.style.filter = "blur(15px)";

  const formModal = document.getElementById("#formModal");
  formModal.style.display = "block";
}

function closeModal() {
  const body = document.getElementById("#body");
  body.style.filter = "none";

  const formModal = document.getElementById("#formModal");
  formModal.style.display = "none";
}

function openMeetingModal() {
  const formModal = document.getElementById("#formModal");
  formModal.style.display = "none";

  const meetingModal = document.getElementById("#meetingModal");
  meetingModal.style.display = "block";
}

function closeMeetingModal() {
  const body = document.getElementById("#body");
  body.style.filter = "none";
  const meetingModal = document.getElementById("#meetingModal");
  meetingModal.style.display = "none";
}

function handlerAssistanceOnchange(){
  const supportRow = document.getElementById("support-row");
  supportRow.style.display = "block";
}

function handlerSupportOnchange() {
  const getHelpBtn = document.querySelector('.get-help')
  getHelpBtn.style.display = "block";
}

//Make the DIV element draggagle:
dragElement(document.getElementById("local-video-section"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "local-video")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "local-video").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}