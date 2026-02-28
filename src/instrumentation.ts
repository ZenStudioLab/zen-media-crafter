import { StrategyRegistry } from '@/registry/strategy-registry';
import { OpenAIAdapter } from '@/adapters/llm/openai-adapter';

export async function register() {
    const openaiKey = process.env.OPENAI_API_KEY || 'default-key';
    const openaiAdapter = new OpenAIAdapter(openaiKey);
    StrategyRegistry.getInstance().registerLLMProvider('openai', openaiAdapter);
}
