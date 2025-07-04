import server from "./api";

const port =
    process.env.PORT || process.env.NODE_ENV === "development" ? 5000 : 3000;

server.listen(port, () => console.log(`Server running on port ${port}`));
