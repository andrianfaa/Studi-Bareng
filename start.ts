import server from "./api";

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Server running on port ${port}`));
