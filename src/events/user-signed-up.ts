import { BaseAuthEvent } from "./";
import { IUserDocument } from "../models";

export type UserSignedUpRestPayload = {
  id: string,
  email: string
};

export default class UserSignedUp<TRest = unknown> extends BaseAuthEvent {
  protected user: IUserDocument;
  statusCode = 201;

  constructor(userDoc: IUserDocument) {
    super();

    this.user = userDoc;
  }

  serializeRest(): UserSignedUpRestPayload {
    return { id: this.user._id, email: this.user.email };
  };
};