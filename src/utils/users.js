const users = [];

const addUser = ({ id, username, room }) => {
  // Clean the data

  console.log(username);
  console.log(room);
  // username = username.trim().toLowerCase();
  // room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) return { error: "Username and room are required" };

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // valdiate username
  if (existingUser) return { error: "this user already exist!" };

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const findUser = users.find((user) => user.id === id);
  return findUser;
};

const getUsersInRoom = (room) => {
  const userRoom = users.filter((user) => user.room === room);
  return userRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
