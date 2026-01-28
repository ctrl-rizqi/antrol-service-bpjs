export type taskProgressProps = {
  task: {
    task_id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    status: "DONE" | "FAILED";
    date: Date;
  }[];
};

export type quotaAggregatorProps = {
  kodedokter: number;
  namadokter: string;
  kodepoli: string;
  namapoli: string;
  jampraktek: string;
  kuotajkn: number;
  sisakuotajkn: number;
  kuotanonjkn: number;
  sisakuotanonjkn: number;
  estimasidilayani: number;
};

export type cursorType = "POLLER" | "REGISTER" | "CHECKIN" | "START" | "FINISH";
