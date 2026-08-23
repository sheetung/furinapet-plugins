const reminders = {
  stand: [
    ["jumping", "坐得有点久啦，起来走两步吧！"],
    ["waiting", "伸伸腰、转转肩，身体会感谢你的。"],
  ],
  water: [
    ["waving", "喝口水吧，别忘记照顾自己。"],
    ["review", "补充一点水分，再继续也不迟。"],
  ],
};

export default {
  async activate(ctx) {
    const interval = Math.max(5, Number(ctx.config.get("intervalMinutes") ?? 45));

    const timer = ctx.timer.setInterval(async () => {
      const type = String(ctx.config.get("reminderType") ?? "mixed");
      const pool = type === "mixed"
        ? [...reminders.stand, ...reminders.water]
        : (reminders[type] ?? reminders.stand);
      const [reaction, message] = pool[Math.floor(Math.random() * pool.length)];
      const bubble = ctx.config.get("showBubble") === false ? undefined : message;
      await ctx.pet.react(reaction, bubble);
    }, interval * 60 * 1000);

    return () => ctx.timer.clearInterval(timer);
  }
};
