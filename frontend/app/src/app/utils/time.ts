// utils/time.ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export const renderTimeAgo = (dateString: string): string => {
  return dayjs(dateString).fromNow(); // 예: "3분 전"
};
