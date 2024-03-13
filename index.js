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
