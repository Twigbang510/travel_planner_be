export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function formatDateReadable(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Ngày trong tuần
    year: 'numeric', // Năm
    month: 'long',   // Tháng
    day: 'numeric',  // Ngày
  };
  const formattedDate = date.toLocaleDateString('en-US', options);
  return formattedDate.replace(/, /g, ', ');
}