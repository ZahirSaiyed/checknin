// types.ts
import { ObjectId } from "bson";
export type InputData = {
    userId: string;
    text: string;
    rating: number;
    timeStamp: Date;
    replies: [string, string][];
  };  

  export type OutputData = {
    _id: string;
    userId: string;
    text: string;
    rating: number;
    timeStamp: Date;
    replies: [string, string][];
    comments: CheckinComment[];
  };  


export type PodInvitation = {
  _id: ObjectId;
  podId: ObjectId;
  inviterUserId: ObjectId;
  expiry: Date | null;
};

export type Pod = {
  _id: ObjectId;
  name: string;
  creatorUserId: ObjectId;
  members: ObjectId[];
};

export type CheckinComment = {
  userId: ObjectId;
  text: string;
};

export type CheckinWithComments = InputData & {
  comments: CheckinComment[];
};