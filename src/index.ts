import { PORT } from "./keys";
import app from "./app";

// Configure mongodb connection
import "./services/mongodb";

// Configure mongo data model
import "./models/AnswerEvaluation";
import "./models/Interview";
import "./models/Question";
import "./models/Subtopic";
import "./models/Topic";
import "./models/User";
import "./services/auth/authenticate";
// INFO: Configuring Local Auth Strategy for passport
// INFO: Used only for "/signin" endpoint - (email & pass in req.body)
import "./services/auth/strategies/localStrategy";
// INFO: Configuring JWT Auth Strategy for passport
// INFO: Used for all other protected endpoints - (access/refresh tokens & http cookies)
import "./services/auth/strategies/jwtStrategy";
// INFO: Configuring OAuth Strategies for passport
// INFO: Used in parallel with JWT strategy - (access/refresh tokens & http cookies)
import "./services/auth/strategies/facebookStrategy";
import "./services/auth/strategies/githubStrategy";
import "./services/auth/strategies/googleStrategy";

app.listen(PORT || 80);