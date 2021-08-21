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

> 기본적인 node-telegram-api 객체 생성후 메시지 발송하는 예제

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

## 예제(usage)

### TypeScript

> 지속적으로 텔레그램 채팅창을 조회하여 상호 작용할 수 있도록 polling 방식으로 telegramApi 객체를 생성한다.

```typescript
import TelegramApi from "node-telegram-api";
// 1. telegram bot 객체 생성
const telegramApi = new TelegramApi(TELEGRAM_TOKEN, {
  polling: true, // polling 여부
  process: "parallel", // parallel: 병렬 메시지 처리, series: 직렬 메시지 처리
});
```

```typescript
// 2. 채팅창에 메시지가 입력되면 실행되는 콜백 Listener를 정의한다.
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
```

```typescript
// 3. 채팅장에 생성된 버튼 클릭시 실행되는 콜백 Listener를 정의한다.
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
```

## Resources

- [CHANGELOG](https://github.com/dryadsoft/node-telegram-api/blob/master/CHANGELOG.md)

## License

[MIT](LICENSE)
