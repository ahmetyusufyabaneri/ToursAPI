exports.getAllUsers = (req, res) => {
  res.status(200).json({ message: "All users recieved" });
};

exports.createUser = (req, res) => {
  res.status(201).json({ message: "User created" });
};

exports.getUser = (req, res) => {
  res.status(200).json({ message: "User recieved" });
};

exports.updateUser = (req, res) => {
  res.status(200).json({ message: "User updated" });
};

exports.deleteUser = (req, res) => {
  res.status(204).json({ message: "User deleted" });
};
