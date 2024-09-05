// utils/sendDiscordWebhook.js
import axios from 'axios';
import { NextResponse } from 'next/server';

export enum Status {
    START = 'starting generation',
    END = 'generation complete',
    ERROR = 'generation failed',
}

export async function sendDiscordWebhook(
    webhook_status: Status,
    userAgent: string,
    url: string,
    webhookUrl: string,
    failedReason?: string,
    successDetails?: string
) {
    console.log('status:', webhook_status)
    const payload = {
        embeds: [
            {
                title: 'Details',
                description: `**status**: ${webhook_status} \n**triggered at**: <t:${Math.floor(Date.now() / 1000)}:R> \n**user-agent**: ${userAgent} \n**url**: ${url}\n`,
                color: 880808,
            },
            failedReason && {
                title: 'Error Details',
                description: failedReason,
                color: 16711680,
            },
            successDetails && {
                title: 'Success Details',
                description: successDetails,
                color: 65280,
            },
        ],
    };

    try {
        await axios.post(webhookUrl, payload);
        console.log('Message sent to Discord successfully');
    } catch (error: any) {
        console.error('Error sending message to Discord:', error.message);
        throw new Error(`Failed to send message to Discord: ${error}`);
    }
}
