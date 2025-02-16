const { generateRandomString } = require("../utils/helper");
const { LoadBalancer } = require("../utils/load-balancer");
const { ProviderManager } = require("../database/provider");

class OpenAIProvider {
    providerName = "openai";
    models = [
        "gpt-3.5-turbo-instruct",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-1106",
        "gpt-3.5-turbo-0125",
        "gpt-4",
        "gpt-4-1106-preview",
        "gpt-4-0125-preview",
        "gpt-4-turbo-preview",
        "gpt-4-turbo-2024-04-09",
        "gpt-4-turbo",
        "gpt-4o",
        "gpt-4o-2024-05-13",
        "gpt-4o-mini",
        "gpt-4o-mini-2024-07-18",
        "chatgpt-4o-latest",
    ]

    streamResponse(response) {
        const encoder = new TextEncoder();

        const processChunk = (chunk) => {
            return JSON.stringify({
                id: generateRandomString(28, "chatcmpl-"),
                object: "chat.completion.chunk",
                created: Date.now(),
                model: chunk.model,
                system_fingerprint: chunk.system_fingerprint,
                choices: [{
                    index: 0,
                    delta: {
                        role: "assistant",
                        content: chunk.choices[0].delta.content
                    },
                    finish_reason: null
                }]
            });
        }

        const streamingReadable = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    controller.enqueue(encoder.encode(`data: ${processChunk(chunk)}\n\n`));
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            }
        });    

        return new Response(streamingReadable, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
            }
        });
    }

    async chatCompletion(req, res) {
        const body = req.body;
        const provider = await ProviderManager.getProvider("openai");
        const chosenWebsite = await LoadBalancer.getBestProvider(provider);

        if (!chosenWebsite) {
            throw new Error("No available provider");
        }

        try {
            const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + chosenWebsite
                },
                body: JSON.stringify({
                    model: body.model,
                    messages: body.messages,
                    temperature: body.temperature,
                    top_p: body.top_p,
                    stream: body.stream,
                    max_tokens: body.max_tokens,
                    presence_penalty: body.presence_penalty,
                    frequency_penalty: body.frequency_penalty,
                    tool_choice: body.tool_choice,
                    tools: body.tools
                })
            });

            if (body.stream) {
                return this.streamResponse(response);
            }

            const jsonResponse = await response.json();

            await ProviderManager.updateProvider(provider, chosenWebsite, true);
            return res.json(jsonResponse);

        } catch (error) {
            console.error(error);
            await ProviderManager.updateProvider(provider, chosenWebsite, false);
            return res.status(500).json({
                error: {
                    message: error.message,
                    code: 500
                }
            });
        }
    }
}

module.exports = OpenAIProvider;