import { StrategyRegistry } from '@/registry/strategy-registry';
import { OpenAIAdapter } from '@/adapters/llm/openai-adapter';
import { AnthropicAdapter } from '@/adapters/llm/anthropic-adapter';
import { GeminiAdapter } from '@/adapters/llm/gemini-adapter';

export async function register() {
    const openaiKey = process.env.OPENAI_API_KEY || 'default-key';
    const anthropicKey = process.env.ANTHROPIC_API_KEY || 'default-key';
    const geminiKey = process.env.GEMINI_API_KEY || 'default-key';

    const openaiAdapter = new OpenAIAdapter(openaiKey);
    const anthropicAdapter = new AnthropicAdapter(anthropicKey);
    const geminiAdapter = new GeminiAdapter(geminiKey);

    StrategyRegistry.getInstance().registerLLMProvider('openai', openaiAdapter);
    StrategyRegistry.getInstance().registerLLMProvider('anthropic', anthropicAdapter);
    StrategyRegistry.getInstance().registerLLMProvider('gemini', geminiAdapter);
}
