Review these final follow-up corrections. No tool calls. Return only important remaining defects or No blocking defects found. Runtime tests are separate.
1. Treat malformed JSON 400, oversized body 413, unsupported content type 415 as invalid_input, not server faults. 429 is still rate_limited. 503 unavailable and other server errors remain errors.
2. Agent and single reading prompts now explicitly say original artwork is not provided as visual input and forbid claiming to see it. Exact card identity, orientation, and keyword data remains tool-generated.

    } catch (error) {
      if (observedTool)
        record({
          event: 'api_failed',
          tool: observedTool,
          locale,
          status:
            error instanceof ApiError && error.status === 429
              ? 'rate_limited'
              : error instanceof InputError ||
                  error instanceof z.ZodError ||
                  (error instanceof ApiError && error.status >= 400 && error.status < 500)
                ? 'invalid_input'
                : error instanceof ApiError && error.status === 503
                  ? 'unavailable'
                  : 'error',
          duration: Date.now() - started,
        });
      if (error instanceof ApiError)
        return json({ error: { code: error.code, message: error.message } }, error.status);
      if (error instanceof InputError)
        return json({ error: { code: 'invalid_input', message: error.message } }, 422);
      if (error instanceof z.ZodError)
        return json(
          {
            error: {
              code: 'invalid_input',
              message: 'Please check the input fields. / 请检查填写内容。',
              fields: error.issues.map((x) => ({ path: x.path.join('.'), code: x.code })),
            },
          },
          422,
        );
      return json(
        {
          error: {
            code: 'internal_error',
            message: 'This request could not be completed. / 本次请求未完成，请稍后再试。',
          },
        },
        500,
      );
    }
  },

  it('records malformed, oversized and unsupported requests as input failures, not service errors', async () => {
    const { sql, env } = database();
    for (const [body, contentType, status] of [
      ['{invalid', 'application/json', 400],
      [JSON.stringify({ text: 'x'.repeat(9000) }), 'application/json', 413],
      ['{}', 'text/plain', 415],
    ] as const) {
      const pending: Promise<unknown>[] = [];
      const response = await worker.fetch(
        new Request('https://wenbu.genedai.me/api/v1/tarot', {
          method: 'POST',
          headers: { 'Content-Type': contentType },
          body,
        }),
        env,
        { waitUntil: (promise: Promise<unknown>) => pending.push(promise) } as unknown as ExecutionContext,
      );
      expect(response.status).toBe(status);
      await Promise.all(pending);
    }
    const report = await analyticsReport(new URL('https://wenbu.genedai.me/api/admin/analytics'), env);
    expect(report.data.summary[0]).toMatchObject({ invalid_inputs: 3, failures: 0 });
    expect(sql.prepare('SELECT COUNT(*) n FROM events WHERE status=?').get('invalid_input')?.n).toBe(3);
    sql.close();
  });
