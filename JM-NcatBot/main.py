from ncatbot.core import BotClient, GroupMessage, PrivateMessage
from ncatbot.utils.config import config
from ncatbot.utils.logger import get_log

import jmcomic

from ncatbot.core.element import (
    MessageChain,  # 消息链，用于组合多个消息元素
    Text,          # 文本消息
    Reply,         # 回复消息
    At,            # @某人
    AtAll,         # @全体成员
    Dice,          # 骰子
    Face,          # QQ表情
    Image,         # 图片
    Json,          # JSON消息
    Music,         # 音乐分享 (网易云, QQ 音乐等)
    CustomMusic,   # 自定义音乐分享
    Record,        # 语音
    Rps,           # 猜拳
    Video,         # 视频
    File,          # 文件
)

_log = get_log()

# 2475479525
# 3142077494

config.set_bot_uin("2475479525")  # 设置 bot qq 号 (必填)
config.set_root("3357581956")  # 设置 bot 超级管理员账号 (建议填写)
config.set_ws_uri("ws://localhost:3001")  # 设置 napcat websocket server 地址
config.set_token("HJP666vergood")  # 设置 token (napcat 服务器的 token)

bot = BotClient()

config = "config.yml"
loadConfig = jmcomic.JmOption.from_file(config)
#如果需要下载，则取消以下注释
manhua = []

@bot.group_event()
async def on_group_message(msg: GroupMessage):
    _log.info(msg)
    # 清空 manhua
    manhua.clear()
    if msg.raw_message.startswith("/jm "):
        # Extract the numeric part after "/jm "
        album_id = msg.raw_message.split("/jm ", 1)[1].strip()
        manhua.append(album_id)

        # Download the album
        loadConfig.download_album(manhua)

        # Construct the file path for the downloaded PDF
        file_path = f"pdf/{album_id}.pdf"

        # Send the file as a message
        msg_chain = MessageChain([
            File(file_path)
        ])
        
        await msg.reply(rtf=msg_chain)


@bot.private_event()
async def on_private_message(msg: PrivateMessage):
    _log.info(msg)
    # 清空 manhua
    manhua.clear()
    if msg.raw_message.startswith("/jm "):
        # Extract the numeric part after "/jm "
        album_id = msg.raw_message.split("/jm ", 1)[1].strip()
        manhua.append(album_id)

        # Download the album
        loadConfig.download_album(manhua)

        # Construct the file path for the downloaded PDF
        file_path = f"pdf/{album_id}.pdf"

        # Send the file as a message
        msg_chain = MessageChain([
            File(file_path)
        ])
        await bot.api.post_private_msg(msg.user_id, rtf=msg_chain)


if __name__ == "__main__":
    bot.run(reload=False)