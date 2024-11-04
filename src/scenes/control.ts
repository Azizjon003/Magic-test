import { Scenes } from "telegraf";
const scene = new Scenes.BaseScene("control");

scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});
scene.hears("📝 Test yaratish", async (ctx: any) => {
  await ctx.scene.enter("testCreation");
});

export default scene;
