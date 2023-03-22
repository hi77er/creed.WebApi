import { connect, set } from "mongoose";

import { MONGO_DB_CONNECTION_STRING } from "../keys";

set('strictQuery', false);

connect(MONGO_DB_CONNECTION_STRING || '')
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.log("mongodb err during connection"));
