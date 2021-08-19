# node-telegram-api

[![npm version](https://img.shields.io/npm/v/node-telegram-api.svg?style=flat-square)](https://www.npmjs.org/package/node-telegram-api)
[![npm downloads](https://img.shields.io/npm/dm/node-telegram-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=node-telegram-api)

## 설치(Installing)

npm 사용:

```bash
$ npm i node-telegram-api
```

yarn 사용:

```bash
$ yarn add node-telegram-api
```

## 예제(usage)

### TypeScript

```typescript
import TelegramApi from "node-telegram-api";

const TELEGRAM_TOKEN = "your telegram token";
const TELEGRAM_CHAT_ID = 123445554; // your telegram chat ID

const telegramApi = new TelegramApi(TELEGRAM_TOKEN);
```

```typescript
// 1.일반 메시지
telegramApi.sendMessage(TELEGRAM_CHAT_ID, "테스트 메시지입니다.");
```

```typescript
// 2.키보드 메시지 예제
const keyboard = [
  ["a", "b", "c"],
  ["d", "e", "f"],
];
telegramApi.sendKeyboardMessage(TELEGRAM_CHAT_ID, "키보드", keyboard);
```

![키보드메시지](https://github.com/dryadsoft/node-telegram-api/blob/master/images/keyboardmessage.JPG)

```typescript
// 3.인라인 버튼 예제
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
```

![키보드메시지](https://github.com/dryadsoft/node-telegram-api/blob/master/images/inlinebutton.JPG)

```typescript
// 4. telegram bot 예제
(async () => {
  try {
    while (true) {
      const arrResult = await telegramApi.getUpdates();
      if (arrResult) {
        arrResult.forEach(async (item) => {
          // await telegramApi.asyncLog(item); // async log
          if (item.message) {
            const {
              message: {
                chat: { id },
                from: { is_bot },
                text,
              },
              update_id,
            } = item;

            if (!is_bot) {
              let sendMsg = "";
              switch (text) {
                case "/start":
                  sendMsg = "텔레그램 봇에 오신걸 환영합니다.";
                  await telegramApi.sendMessage(id, sendMsg);
                  break;
                default:
                  sendMsg = "텔레그램 봇입니다.";
                  await telegramApi.sendMessage(id, sendMsg);
                  break;
              }
            }
          } else if (item.callback_query) {
            // 채팅창의 버튼 메시지에서 버튼클릭시 콜백처리
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
                // data 값은 인라인버튼의 callback_data 값이다.
                sendMsg = `callback_data: ${data}`;
                await telegramApi.sendMessage(id, sendMsg);
                // 인라인버튼이 클릭되고 중복클릭을 방지하고싶다면 인라인버튼을 채팅창에서 삭제한다.
                await telegramApi.deleteMessage(id, message_id);
                break;
            }
          }
        });
      }
      // sleep 1초
      await telegramApi.sleep(1000);
    }
  } catch (err) {
    console.log(err);
  }
})();
```

## Resources

- [CHANGELOG](https://github.com/dryadsoft/node-telegram-api/blob/master/CHANGELOG.md)

## License

[MIT](LICENSE)
