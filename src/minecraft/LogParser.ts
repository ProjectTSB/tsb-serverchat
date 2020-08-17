type ChatData = {
    username: string;
    message: string;
};

type LogType =
    | 'chat'
    | 'system';

type ParserResult = {
    type: LogType;
    message: string;
};

const chatRegex = /^<([^>]*)>\s(.*)$/;
const loginRegex = /^([^[]*)\[[^\]]*\]\slogged\sin\swith\sentity\sid.*$/;
const logoutRegex = /^([^\s]*)\slost\sconnection:\sDisconnected$/;

const parseChat = (message: string): ChatData => {
    const regex = chatRegex.exec(message);

    return {
        username: regex === null ? '' : regex[1],
        message: regex === null ? '' : regex[2].replace('\u001b[m', '')
    };
};

const parseLogin = (message: string): string => {
    const regex = loginRegex.exec(message);

    return regex === null ? '' : regex[1];
};

const parseLogout = (message: string): string => {
    const regex = logoutRegex.exec(message);

    return regex === null ? '' : regex[1];
};

export const LogParser = (log: string): ParserResult | null => {
    if (chatRegex.test(log)) {
        const chat = parseChat(log);

        console.log(`<${chat.username}> ${chat.message}`);
        return {
            type: 'chat',
            message: `【**${chat.username}**】${chat.message}`
        };
    }
    else if (loginRegex.test(log)) {
        const username = parseLogin(log);

        console.log(`${username} がログインしました`);
        return {
            type: 'system',
            message: `**${username}** がログインしました`
        };
    }
    else if (logoutRegex.test(log)) {
        const username = parseLogout(log);

        console.log(`${username} がログアウトしました`);
        return {
            type: 'system',
            message: `**${username}** がログアウトしました`
        };
    }
    else return null;
};
