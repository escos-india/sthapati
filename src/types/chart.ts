export type ChartData = Array<{
  [key: string]: string | number;
}>;

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};
