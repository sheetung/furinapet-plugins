const interactions = [
  ["waving", "嗯？是在叫我吗？"],
  ["review", "你刚刚是不是戳了我一下？"],
  ["waiting", "我有在认真陪着你哦。"],
  ["jumping", "嘿嘿，抓到你啦！"],
  ["failed", "再戳的话，我可要记仇啦……"],
];

export default {
  async activate(ctx) {
    let lastClickAt = 0;
    let streak = 0;

    const bubble = (text) => ctx.config.get("showBubble") === false ? undefined : text;

    ctx.events.on("pet:clicked", async () => {
      const now = Date.now();
      const windowMs = Number(ctx.config.get("streakWindowMs") ?? 1800);
      const triggerCount = Number(ctx.config.get("streakCount") ?? 3);

      streak = now - lastClickAt <= windowMs ? streak + 1 : 1;
      lastClickAt = now;

      if (streak >= triggerCount) {
        streak = 0;
        await ctx.pet.react("jumping", bubble("好啦好啦！我知道你在这里啦！✨"));
        return;
      }

      const [reaction, message] = interactions[Math.floor(Math.random() * interactions.length)];
      await ctx.pet.react(reaction, bubble(message));
    });

    ctx.events.on("pet:doubleClicked", async () => {
      streak = 0;
      const message = String(ctx.config.get("doubleClickMessage") ?? "哇！突然这么热情，我都吓了一跳！✨");
      await ctx.pet.react("jumping", bubble(message));
    });
  }
};
