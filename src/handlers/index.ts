import { handleHello } from './hello.handler';
import { handleBye } from './bye.handler';

export const MessageHandlers = {
  hello: handleHello,
  bye: handleBye,
};
