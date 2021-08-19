import TelegramApi from ".";

const TELEGRAM_TOKEN = "your telegram token";
const TELEGRAM_CHAT_ID = 123445554; // your telegram chat ID

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

(async () => {
  try {
    while (true) {
      const arrResult = await telegramApi.getUpdates();
      if (arrResult) {
        arrResult.forEach(async (item) => {
          // await telegramApi.asyncLog(item);
          if (item.message) {
            const {
              message: {
                chat: { id },
                from: { is_bot },
                text,
              },
              update_id,
            } = item;
            // 지정한 chat_id에만 메시지 발송
            if (!is_bot) {
              let sendMsg = "";
              switch (text) {
                case "/start":
                  sendMsg = "텔레그램 봇에 오신걸 환영합니다.";
                  await telegramApi.sendMessage(id, sendMsg);
                  break;
                default:
                  sendMsg = "a텔레그램 봇입니다.";
                  await telegramApi.sendMessage(id, sendMsg);
                  break;
              }
            }
          } else if (item.callback_query) {
            // 채팅창의 버튼클릭시 콜백처리
            const {
              callback_query: {
                message: {
                  message_id,
                  chat: { id },
                  text,
                },
                data,
              },
              update_id,
            } = item;
            let sendMsg = "";
            // text값은 inline버튼의 message 값이다.
            switch (text) {
              case "인라인버튼":
                // data값은 인라인버튼의 callback_data 값이다.
                sendMsg = `callback_data: ${data}`;
                await telegramApi.sendMessage(id, sendMsg);
                // 인라인버튼이 클릭되고 중복클릭을 방지하고싶다면 인라인버튼을 채팅창에서 삭제한다.
                await telegramApi.deleteMessage(id, message_id);
                break;
            }
          }
        });
      }
      // sleep
      await telegramApi.sleep(1000);
    }
  } catch (err) {
    console.log(err);
  }
})();
