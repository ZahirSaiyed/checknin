// types.ts
export type InputData = {
    userId: string;
    text: string;
    rating: number;
    timeStamp: Date;
    replies: [string, string][];
    linkAccess: boolean;
    pod: string;
  };  

export type OutputData = {
  _id: string;
  userId: string;
  text: string;
  rating: number;
  timeStamp: Date;
  replies: [string, string][];
  linkAccess: boolean;
  pod: string;
};  

export type Pod = {
  _id: string;
  userId: string;
  name: string;
  members: string[];
};  