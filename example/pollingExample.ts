import "dotenv/config";
import TelegramApi from "../src";

const TELEGRAM_TOKEN = <string>process.env.TELEGRAM_TOKEN; // your telegram token
const TELEGRAM_CHAT_ID = Number(<string>process.env.TELEGRAM_CHAT_ID); // your telegram chat ID

const telegramApi = new TelegramApi(TELEGRAM_TOKEN, {
  polling: true,
  process: "series",
});

// 1. 채팅창 메시지 입력 후 콜백처리
// telegramApi.on("init", asyc() => {});
telegramApi.init((options) => {
  options.isAlarmOn = false;
});

// 텔레그램채팅창 하단에 키보드버튼생성
const getStartKeyboard = (isAlarmOn: boolean) => {
  const alarmOnOfButton = isAlarmOn ? "/알람 끄기" : "/알람 켜기";
  return [
    [alarmOnOfButton, "/코인선택"],
    [`/볼밴`, `/RSI`, `/캔들`],
  ];
};
// 인라인버튼
const getInlineButton = () => {
  return [
    [
      { text: "비트코인", callback_data: "BTC" },
      { text: "리플", callback_data: "XRP" },
      { text: "이더리움", callback_data: "ETH" },
    ],
    [
      { text: "비트코인캐시", callback_data: "BCH" },
      { text: "라이트코인", callback_data: "LTC" },
      { text: "스크라이크", callback_data: "STRK" },
    ],
  ];
};
// 1. 채팅창 메시지 입력 후 콜백처리
telegramApi.on("text", async ({ chatId, messageId, text, options }) => {
  let sendMsg = "";

  switch (text) {
    case "/start":
      sendMsg = "텔레그램 봇에 오신걸 환영합니다.";
      await telegramApi.sendKeyboardMessage(
        chatId,
        sendMsg,
        getStartKeyboard(options?.isAlarmOn)
      );
      break;
    case "/알람 켜기":
      sendMsg = "알람이 켜졌습니다";
      options && (options.isAlarmOn = true);
      await telegramApi.sendKeyboardMessage(
        chatId,
        sendMsg,
        getStartKeyboard(options?.isAlarmOn)
      );
      break;
    case "/알람 끄기":
      sendMsg = "알람이 꺼졌습니다";
      options && (options.isAlarmOn = false);
      await telegramApi.sendKeyboardMessage(
        chatId,
        sendMsg,
        getStartKeyboard(options?.isAlarmOn)
      );
      break;
    case "/코인선택":
      sendMsg = "코인을 선택하십시오.";
      telegramApi.sendInlineButtonMessage(chatId, sendMsg, getInlineButton());
      break;
    default:
      sendMsg = `텔레그램 봇입니다.[${text}]`;
      await telegramApi.sendMessage(chatId, sendMsg);
      break;
  }
});

// 2. 채팅창 버튼클릭 후 콜백처리
telegramApi.on(
  "callback",
  async ({ chatId, messageId, text, data, options }) => {
    let sendMsg = "";
    // text값은 inline버튼의 message 값이다.
    switch (text) {
      case "코인을 선택하십시오.":
        // data값은 인라인버튼의 callback_data 값이다.
        sendMsg = `callback_data: ${data}`;
        await telegramApi.sendMessage(chatId, sendMsg);
        // 인라인버튼이 클릭되고 중복클릭을 방지하고싶다면 인라인버튼을 채팅창에서 삭제한다.
        await telegramApi.deleteMessage(chatId, messageId);
        break;
    }
  }
);

(() => {
  setInterval(() => {
    const options = telegramApi.getOptions();
    if (options.isAlarmOn) {
      telegramApi.pushMessageQueue({
        chatId: TELEGRAM_CHAT_ID,
        message: "test",
      });
    }
  }, 3000);
})();
