// types.ts
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
  };  