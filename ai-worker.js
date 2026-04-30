/**
 * Refined_AI Background Worker
 * Handles heavy LLM inference off the main thread to prevent UI freezing.
 */

let aiEngine = null;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'init') {
        try {
            const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
            env.allowLocalModels = false;

            aiEngine = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
                progress_callback: (p) => {
                    self.postMessage({ type: 'progress', payload: p.progress });
                }
            });

            self.postMessage({ type: 'ready' });
        } catch (err) {
            self.postMessage({ type: 'error', payload: err.message });
        }
    }

    if (type === 'generate') {
        if (!aiEngine) return;

        try {
            const { query, context } = payload;
            const prompt = `<|im_start|>system\n${context}<|im_end|>\n<|im_start|>user\n${query}<|im_end|>\n<|im_start|>assistant\n`;

            const output = await aiEngine(prompt, {
                max_new_tokens: 100,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false,
            });

            self.postMessage({ 
                type: 'response', 
                payload: output[0].generated_text 
            });
        } catch (err) {
            self.postMessage({ type: 'error', payload: err.message });
        }
    }
};