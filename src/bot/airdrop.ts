import { Composer } from 'grammy';
import type { Context } from '#root/bot/context.js';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { createThirdwebClient, toWei, prepareTransaction, sendTransaction } from 'thirdweb';
import { config } from 'dotenv';
import { isAddress } from 'ethers';
import { xaiSepolia } from 'thirdweb/chains';

config();

const composer = new Composer<Context>();

const feature = composer.chatType('private');

const client = createThirdwebClient({ clientId: process.env.THIRDWEB_CLIENT_ID as string });

const adminAccount = privateKeyToAccount({
  privateKey: process.env.ADMIN_SECRET_KEY as string,
  client,
});

feature.command('airdrop', async (ctx) => {
  try {
    const messageParts = ctx.message?.text?.split(' ');
    if (!messageParts || messageParts.length < 2) {
      return ctx.reply('Please provide your Xai wallet address. Usage: /airdrop <your_wallet_address>');
    }

    const recipientAddress = messageParts[1];
    if (!isAddress(recipientAddress)) {
      return ctx.reply('Invalid Xai wallet address. Please provide a valid address.');
    }

    const transaction = prepareTransaction({
      to: recipientAddress,
      value: toWei("0.001"),
      chain: xaiSepolia,
      client,
    });

    const tx = await sendTransaction({ transaction, account: adminAccount });

    return ctx.reply(`Airdrop successful! https://testnet-explorer-v2.xai-chain.net/tx/${tx.transactionHash}`);
  } catch (error) {
    console.error('Airdrop failed:', error);
    return ctx.reply('Airdrop failed. Please try again later.');
  }
});

export { composer as airdropFeature };