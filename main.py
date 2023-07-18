# This example requires the 'message_content' intent.

import discord
import re
import os
import datetime
import unicodedata
from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

INU_ID      = int(os.environ.get('INU_ID'))
INU_CH_ID   = int(os.environ.get('INU_CH_ID'))
INU_SRV_ID  = int(os.environ.get('INU_SRV_ID'))
INU_ROLE_ID = int(os.environ.get('INU_ROLE_ID'))
TOKEN = os.environ.get('TOKEN')

re_date = re.compile('[0-1]?\d\/[0-3]?\d')
re_money = re.compile('([1-9][0-9\,]*)')
re_removes = [
    re.compile('\d+[回|人|年|本|杯|月|日]'),
]
re_replaces = [
    (re.compile('万'), '0000+'),
    (re.compile('千'), '000+'),
    (re.compile('k'), '000+'),
]
re_role = re.compile('.*?(\d+)')
re_reply = re.compile('.*?([+|-]\d+)円.+\*\*(\d+)円\*\*', re.DOTALL)
re_comma = re.compile('\,')

kansuzi_table = str.maketrans('一二三四五六七八九', '123456789')

intents = discord.Intents.default()
intents.message_content = True

def parse_message(msg_str, default_date):
    for line in msg_str.split("\n"):
        total = 0
        today = default_date
        for word in line.split(" "):

            for re_remove in re_removes:
                word = re.sub(re_remove, '', word)

            for re_replace in re_replaces:
                word = re.sub(re_replace[0], re_replace[1], word)

            match_date = re_date.match(word)
            if match_date:
                print("date: " + match_date.group())
                today = "{}/{}".format(datetime.datetime.now().year, match_date.group())
                word = re.sub(re_date, '', word)    
        
            results = re.findall(re_money, word)
            if results:
                for result in results:
                    print("money: " + result)
                    total += int(re.sub(re_comma, '', result))

        today = datetime.datetime.strptime(today, "%Y/%m/%d")
        print(f'{today}: {total}')

        #details.append(f'{today}: +{total}円')
        return total

def parse_bot_reply(msg_str):
    re_result = re.match(re_reply, msg_str)
    if not (re_result and re_result.group(1) and re_result.group(2)):
        return
    return int(re_result.group(1)), int(re_result.group(2))

async def send_reply(spent_money, total, inu_role, channel):
    print(spent_money)
    await inu_role.edit(
        name=f'犬の使った額: {total}円',
    )
    res_msg = await channel.send(
        f'[更新]{spent_money:+}円, 犬の使った額: **{total}円**'
    )
    
    #await res_msg.add_reaction("❌")
    #await res_msg.add_reaction("🆗")

async def calc_message(msg, inu_role, created_at):
    msg_str = unicodedata.normalize('NFKC', msg.content)
    msg_str = msg_str.translate(kansuzi_table)

    spent_money = parse_message(msg_str, created_at.strftime('%Y/%m/%d'))
        
    if spent_money <= 0:
        #msg.channel.send("[エラー]記録できませんでした")
        return
    total = int(re_role.match(inu_role.name).group(1))
    total += spent_money
    await send_reply(spent_money, total, inu_role, msg.channel)

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')


@client.event
async def on_message(message):

    server = client.get_guild(INU_SRV_ID)
    inu_role = server.get_role(INU_ROLE_ID)

    if message.author == client.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')
        return
    
    if message.content.startswith('$set'):
        argv = message.content.split()
        await inu_role.edit(
            name=f'犬の使った額: {argv[1]}円',
        )
        await message.channel.send(
            f'[変更]金額を`{argv[1]}`に変更しました'
        )
        return
    
    if message.author.id == INU_ID and message.channel.id == INU_CH_ID:
        print("catch calc")
        await calc_message(message, inu_role, message.created_at)
        return
        

@client.event
async def on_raw_reaction_add(payload):

    if payload.user_id == client.user.id:
        return
    if payload.channel_id != INU_CH_ID:
        print(payload.channel_id)
        return
    
    server = client.get_guild(INU_SRV_ID)
    channel = server.get_channel(INU_CH_ID)
    inu_role = server.get_role(INU_ROLE_ID)

    reactchannel = client.get_channel(payload.channel_id)
    msg = await reactchannel.fetch_message(payload.message_id)
    msg_str = msg.content
    print(msg_str)
    
    if str(payload.emoji) == "❌":
        if msg.author != client.user:
            return

        result = parse_bot_reply(msg_str)
        if not result:
            return
        spent, old_total = result
        print(spent, old_total)
        total = int(re_role.match(inu_role.name).group(1))
        total -= spent
        
        await send_reply(-spent, total, inu_role, channel)
        #await msg.clear_reactions()
        return

    if str(payload.emoji) == "✅":

        await calc_message(msg, inu_role, message.created_at)
        #await msg.clear_reactions()
        return

    if str(payload.emoji) == "🆗":
        #await msg.clear_reactions()
        return


client.run(TOKEN)
