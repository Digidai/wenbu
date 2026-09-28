Read-only final verification of the three specific defects you found. Do not use tools. The updated source excerpts below are the current code. The tool-call loop receives already validated unique IDs, and tool calls all belong to the immediately preceding assistant message. Requests that are not a whole affirmative redraw command conservatively reuse prior cards; explicit API newDraw:true is user intent. Check these fixes for concrete defects only; no hypothetical scope expansion. Give a concise verdict, distinguish fixed from open, and do not claim to have run tests.

export function requestsNewDraw(message: string) {
  // Only whole, affirmative commands authorize replacement. A substring inside
  // a refusal, quotation, hypothetical, or longer discussion never grants it.
  // Native clients can express the same explicit action with newDraw: true.
  const command = message.trim().replace(/[.!?。！？\s]+$/g, '');
  return (
    /^(?:请|请你|请帮我|帮我|麻烦|我想|我要)?(?:重新抽(?:取)?|重抽|再抽)(?:(?:一|三|1|3)张(?:塔罗)?牌?|(?:一|三|1|3)张塔罗|塔罗牌?|牌)?(?:吧|一下)?$/.test(
      command,
    ) ||
    /^(?:请|请你|请帮我|帮我|麻烦|我想|我要)?(?:重新起(?:一)?卦|再起一卦|重起一卦)(?:吧|一下)?$/.test(
      command,
    ) ||
    /^(?:please\s+|can you\s+|could you\s+|let['’]s\s+)?(?:redraw|recast|(?:draw|cast)\s+again|draw\s+(?:another|a new)\s+(?:card|spread)|cast\s+(?:another|a new)\s+hexagram)(?:\s+for\s+(?:a\s+)?(?:different|new)\s+question)?(?:,?\s+please)?$/i.test(
      command,
    )
  );
}



  if (!quota.allowed) {
    const reason = quota.reason ?? 'daily_allowance';
    throw new ApiError(
      429,
      reason,
      reason === 'daily_allowance'
        ? 'This network has used its daily Agent turns. The allowance resets at midnight in Shanghai. / 当前网络的今日对话回合已用完，上海时间零点后恢复；历史记录与工具仍可使用。'
        : 'The shared site Agent budget is used for today. It resets at midnight in Shanghai. / 全站今日共享模型预算已用完，上海时间零点后恢复；这不是你的个人回合不足，历史记录与工具仍可使用。',
    );
  }


          // Clarification preempts the entire batch, even if a draw precedes it.
          const questionCall = calls.find((call) => call.function.name === 'ask_user');
          if (questionCall) {
            // Even if the clarification arguments fail validation, the next model
            // request must contain a result for every assistant tool-call ID.
            for (const skipped of calls.filter((call) => call !== questionCall))
              messages.push({
                role: 'tool',
                tool_call_id: skipped.id,
                content: JSON.stringify({
                  error: 'Skipped because clarification is required. No action was taken.',
                }),
              });
          }
          for (const call of questionCall ? [questionCall] : calls) {
            if (abort.signal.aborted) throw new DOMException('Aborted', 'AbortError');
            if (toolCalls >= AGENT_TOOL_CALLS) {
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify({ error: 'Tool budget exhausted. Summarize existing evidence.' }),
              });
              continue;
            }
            toolCalls++;
            const traceId = `${modelCalls}:${call.id}`;
            emit({ type: 'tool_start', tool: toolTrace(traceId, call.function.name, input.locale) });
            try {
              const output = await executeAgentTool(call.function.name, JSON.parse(call.function.arguments), {
                locale: input.locale,
                signal: abort.signal,
                emit,
                sources,
                readings,
                allowNewDraw,
                generatedRandom,
              });
              messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output) });
              emit({
                type: 'tool_end',
                id: traceId,
                status: 'complete',
                detail: input.locale === 'zh' ? '已完成' : 'Completed',
              });
              if (call.function.name === 'ask_user') {
                waiting = true;
                break;
              }
            } catch (error) {
              if (abort.signal.aborted) throw error;
              const detail =
                error instanceof z.ZodError
                  ? 'Invalid tool arguments. Check required fields and conventions; ask the user if information is missing.'
                  : error instanceof Error
                    ? error.message.slice(0, 350)
                    : 'Tool failed.';
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify({ error: detail }),
              });
              emit({ type: 'tool_end', id: traceId, status: 'error', detail });
            }
          }
