/**
 * Groq AI Service
 * Handles all AI-related operations
 */
import Groq from "groq-sdk";
import { config } from "../config/environment.js";
import { VPN_SYSTEM_PROMPT } from "../constants/prompts.js";
class GroqService {
    groq;
    model;
    constructor() {
        this.groq = new Groq({ apiKey: config.GROQ_API_KEY });
        this.model = config.AI_MODEL;
    }
    /**
     * Send messages to Groq and get AI response
     * @param messages - Array of chat messages with conversation history
     * @returns AI-generated response
     */
    async getResponse(messages) {
        try {
            // Build conversation with system prompt
            const conversation = [
                { role: "system", content: VPN_SYSTEM_PROMPT },
                ...messages,
            ];
            // Call Groq API
            const completion = await this.groq.chat.completions.create({
                model: this.model,
                messages: conversation,
                temperature: 0.7,
                max_tokens: 300,
            });
            const reply = completion.choices[0]?.message?.content;
            if (!reply) {
                throw new Error("Empty response from Groq");
            }
            return reply;
        }
        catch (error) {
            console.error("Groq API error:", error);
            throw new Error("Failed to get AI response");
        }
    }
    /**
     * Stream chat response chunks from Groq and invoke a callback per partial update.
     * @param messages - Conversation history
     * @param onDelta - Called for each streamed text delta
     */
    async streamResponse(messages, onDelta) {
        try {
            const conversation = [
                { role: "system", content: VPN_SYSTEM_PROMPT },
                ...messages,
            ];
            const stream = await this.groq.chat.completions.create({
                model: this.model,
                messages: conversation,
                temperature: 0.7,
                max_tokens: 300,
                stream: true,
            });
            let fullReply = "";
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content;
                if (delta) {
                    fullReply += delta;
                    onDelta(delta);
                }
            }
            if (!fullReply) {
                throw new Error("Empty streamed response from Groq");
            }
            return fullReply;
        }
        catch (error) {
            console.error("Groq streaming error:", error);
            throw new Error("Failed to stream AI response");
        }
    }
}
// Export singleton instance
export const groqService = new GroqService();
