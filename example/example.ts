import "dotenv/config";
import TelegramApi from "../src";

const TELEGRAM_TOKEN = <string>process.env.TELEGRAM_TOKEN; // 텔레그램 토큰
const TELEGRAM_CHAT_ID = Number(<string>process.env.TELEGRAM_CHAT_ID); // 텔레그램 chat ID

const telegramApi = new TelegramApi(TELEGRAM_TOKEN);

// 1.키보드 메시지 예제
const keyboard = [
  ["a", "b", "c"],
  ["d", "e", "f"],
];
telegramApi.sendKeyboardMessage(TELEGRAM_CHAT_ID, "키보드", keyboard);

// 2.인라인 버튼 예제
const inlineButton = [
  [
    { text: "버튼1", callback_data: "1" },
    { text: "버튼2", callback_data: "2" },
    { text: "버튼3", callback_data: "3" },
  ],
  [
    { text: "버튼4", callback_data: "4" },
    { text: "버튼5", callback_data: "5" },
    { text: "버튼6", callback_data: "6" },
  ],
];
telegramApi.sendInlineButtonMessage(
  TELEGRAM_CHAT_ID,
  "인라인버튼",
  inlineButton
);
