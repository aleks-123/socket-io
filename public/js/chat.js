const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sideBar = document.querySelector("#sidebar");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;
  // Height of the last message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  //visibleHeight
  const visibleHeight = $messages.offsetHeight;
  //height of messages container
  const containerHeight = $messages.scrollHeight;
  //how far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  console.log(containerHeight);
  console.log(newMessageHeight);
  console.log(scrollOffset);

  if (containerHeight - newMessageHeight >= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (objMessage) => {
  const html = Mustache.render(messageTemplate, {
    username: objMessage.username,
    message: objMessage.text,
    createdAt: moment(objMessage.createdAt).format("HH:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (objLocation) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: objLocation.username,
    link: objLocation.url,
    createdAt: moment(objLocation.createdAt).format("HH:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  console.log(room, users);
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });

  $sideBar.innerHTML = html;
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

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
