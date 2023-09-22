const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (objLocation) => {
  const html = Mustache.render(locationMessageTemplate, {
    link: objLocation.url,
    createdAt: moment(objLocation.createdAt).format("HH:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // disable
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    // enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) return console.log(error);
    console.log("message delivered");
  });
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geo nos supported on your browser.");

  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position, atr) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (aknowledge) => {
        $locationButton.removeAttribute("disabled");
        console.log(aknowledge);
      }
    );
  });
});
