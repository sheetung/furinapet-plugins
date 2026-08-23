export default {
  async activate(ctx) {
    let phase = (await ctx.storage.get("phase")) ?? "focus";
    let timer = null;

    const minutesFor = (value) => {
      const key = value === "focus" ? "focusMinutes" : "breakMinutes";
      return Math.max(1, Number(ctx.config.get(key) ?? (value === "focus" ? 25 : 5)));
    };

    const schedule = async () => {
      if (timer) ctx.timer.clearTimeout(timer);

      const minutes = minutesFor(phase);
      await ctx.storage.set("phase", phase);

      if (ctx.config.get("showStartBubble") !== false) {
        const text = phase === "focus"
          ? `专注 ${minutes} 分钟，我陪着你。`
          : `休息 ${minutes} 分钟，活动一下吧。`;
        await ctx.pet.react(phase === "focus" ? "review" : "waiting", text);
      }

      timer = ctx.timer.setTimeout(async () => {
        if (phase === "focus") {
          phase = "break";
          await ctx.pet.react("jumping", "这一轮完成啦！起来休息一下吧 ✨");
        } else {
          phase = "focus";
          await ctx.pet.react("waving", "休息结束，要开始下一轮了吗？");
        }

        if (ctx.config.get("autoContinue") !== false) {
          await schedule();
        } else {
          await ctx.storage.set("phase", phase);
        }
      }, minutes * 60 * 1000);
    };

    await schedule();

    return () => {
      if (timer) ctx.timer.clearTimeout(timer);
    };
  }
};
