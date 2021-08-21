import "dotenv/config";
import TelegramApi from "../src";

const TELEGRAM_TOKEN = <string>process.env.TELEGRAM_TOKEN; // your telegram token
// const TELEGRAM_CHAT_ID = Number(<string>process.env.TELEGRAM_CHAT_ID); // your telegram chat ID

const telegramApi = new TelegramApi(TELEGRAM_TOKEN, {
  polling: true,
  process: "parallel",
});

// 1. 채팅창 메시지 입력 후 콜백처리
telegramApi.on("text", async ({ chatId, messageId, text }) => {
  let sendMsg = "";
  switch (text) {
    case "/start":
      sendMsg = "텔레그램 봇에 오신걸 환영합니다.";
      await telegramApi.sendMessage(chatId, sendMsg);
      break;
    default:
      sendMsg = `텔레그램 봇입니다.[${text}]`;
      await telegramApi.sendMessage(chatId, sendMsg);
      break;
  }
});

// 2. 채팅창 버튼클릭 후 콜백처리
telegramApi.on("callback", async ({ chatId, messageId, text, data }) => {
  let sendMsg = "";
  // text값은 inline버튼의 message 값이다.
  switch (text) {
    case "인라인버튼":
      // data값은 인라인버튼의 callback_data 값이다.
      sendMsg = `callback_data: ${data}`;
      await telegramApi.sendMessage(chatId, sendMsg);
      // 인라인버튼이 클릭되고 중복클릭을 방지하고싶다면 인라인버튼을 채팅창에서 삭제한다.
      await telegramApi.deleteMessage(chatId, messageId);
      break;
  }
});
