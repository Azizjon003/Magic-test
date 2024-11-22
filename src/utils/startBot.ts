const botStart = (bot: any) => {
  bot
    .launch()
    .then(() => {
      console.log("started");
    })
    .catch((err: any) => {
      console.log("error", err);
    });
  console.log(`Bot nimadir has been started...`);
};

export default botStart;
