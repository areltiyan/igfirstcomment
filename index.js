const { IgApiClient } = require('instagram-private-api')
const ig = new IgApiClient();
const fs = require('fs');
const readlineSync = require('readline-sync');
const delay = require('delay');
const moment = require('moment');

(async () => {

  try {

    let isLimit = false
    let temporaryData = new Object()
    console.log(`FIRST COMMENT CREATED BY AREL TIYAN\nSGB TEAM 2020\nCEK komen.txt DENGAN PEMISAH |\n`)

    //Get Requiretment Data
    const usernameInstagram = readlineSync.question("Username : ")
    const passwordInstagram = readlineSync.question("Password : ")
    const target = readlineSync.question("Target (Pakai , Jika lebih dari 1) : ").split(',')
    const sleep = readlineSync.question("Jeda Berapa Detik (s): ")
    const limitSleep = readlineSync.question("Jika Limit Kasih Jeda Berapa Detik? (s): ")


    ig.state.generateDevice(user_name);
    await ig.simulate.preLoginFlow();
    await ig.account.login(usernameInstagram, passwordInstagram);

    //Grab Komen List from komen.txt
    const read_komen = fs.readFileSync("./komen.txt", "utf-8").split("|");


    //Get Latest Photo
    for (const user of target) {
      const id = await ig.user.getIdByUsername(user);
      const userFeed = ig.feed.user(id);
      const myPostsFirstPage = await userFeed.items()
      temporaryData[id] = myPostsFirstPage.length > 0 ? myPostsFirstPage[0].id : undefined
    }

    while (true) {
      try {

        for (const [key, value] of Object.entries(temporaryData)) {
          if (isLimit) {
            console.log(`Delay ${limitSleep} detik karena LIMIT`)
            await delay(limitSleep * 1000)
            isLimit = false
          }

          const id = await ig.user.getIdByUsername(user);
          const userFeed = ig.feed.user(id);
          const myPostsFirstPage = await userFeed.items()
          const latestPost = myPostsFirstPage.length > 0 ? myPostsFirstPage[0].id : undefined

          if (latestPost != value) {
            try {
              const komen = read_komen[parseInt(Math.random() * read_komen.length)]
              await ig.media.comment({ mediaId: latestPost, text: komen })
              console.log(`[ ${moment().format('HH:mm:ss')} ] [SUKSES KOMEN @${target}] [${komen}]`)
              temporaryData[key] = latestPost
            } catch (err) {
              console.log(`[ ${moment().format('HH:mm:ss')} ] [FAILED KOMEN @${target}] [${err.toString()}]`)
            }
          }

          await delay(sleep * 1000)
        }
      } catch (err) {
        if (err.toString().includes('before you try again.')) { isLimit = true }
        console.log(err.toString())
      }
    }

  } catch (err) {
    console.error(err.toString())
  }

})();
