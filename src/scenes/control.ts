import { Scenes } from "telegraf";
const scene = new Scenes.BaseScene("control");

scene.hears("/start", async (ctx: any) => {
  await ctx.scene.leave();
  return await ctx.scene.enter("start");
});
scene.hears("📝 Test yaratish", async (ctx: any) => {
  await ctx.scene.enter("testCreation");
});

scene.hears("💰 Balans", async (ctx: any) => {
  await ctx.scene.enter("balance");
});

export default scene;
