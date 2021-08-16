# node-telegram-api

```bash
$ yarn add node-telegram-api
또는
$ npm i node-telegram-api
```

```typescript
import TelegramApi from "node-telegram-api";

const TELEGRAM_TOKEN = "your telegram token";
const TELEGRAM_CHAT_ID = "your telegram chat ID";

(async () => {
  try {
    const telegramApi = new TelegramApi(TELEGRAM_TOKEN, TELEGRAM_CHAT_ID);

    while (true) {
      const result = await telegramApi.getUpdates();
      await telegramApi.asyncLog(result);
      await telegramApi.sleep(1000);
    }
  } catch (err) {
    console.log(err);
  }
})();
```
