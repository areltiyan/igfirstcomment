const { IgApiClient } = require('instagram-private-api')
const ig = new IgApiClient();
const fs = require('fs');
const readlineSync = require('readline-sync');
const delay = require('delay');
const moment = require('moment');

function GetRandomID(dataid)
{
    const values = Object.values(dataid)
        const randomValue = values[parseInt(Math.random() * values.length)]

    return(randomValue);
};

async function Execute(target, ig, komen, latest_id)
{
    fs.readFile('./target/' + target + '.txt', {encoding: 'utf-8'}, async function(err,data){
        if (!err) {
            if(latest_id != data)
            {
                try{
                  const start = await ig.media.comment({mediaId: latest_id, text: komen})
                  console.log(`[ ${moment().format('HH:mm:ss')} ] [SUKSES KOMEN @${target}] [${komen}]`)
                  
                }catch(err)
                {
                  console.log(`[ ${moment().format('HH:mm:ss')} ] [FAILED KOMEN @${target}] [${err.toString()}]`)
                }
                fs.writeFileSync('./target/' + target + '.txt', latest_id);
            }else{
                console.log(`[ ${moment().format('HH:mm:ss')} ] TIDAK MENEMUKAN POST BARU`, target)
            }
            
        } else {
            console.log(err)
        }
    }); 
}

(async () => {

  
  try{
    let enabled = 0 ;
    let checking = 0;
    let starting = 0;
    console.log(`FRIST COMMENT CREATED BY AREL TIYAN\nSGB TEAM 2020\nCEK komen.txt DENGAN PEMISAH |\n`)
    const user_name   = readlineSync.question("Username : ")
    const pass_word   = readlineSync.question("Password : ")
    var tar_get       = readlineSync.question("Target (Pakai , Jika lebih dari 1) : ").split(',')
    var jeda          = readlineSync.question("Jeda Berapa Detik : ")
    var jeda_limit          = readlineSync.question("Jika Limit Kasih Jeda Berapa Detik? : ")
    ig.state.generateDevice(user_name);
    await ig.simulate.preLoginFlow();

    const loggedInUser = await ig.account.login(user_name, pass_word);

    var read_komen = fs.readFileSync("./komen.txt","utf-8").split("|");
    
    for(let i = 0;i < tar_get.length;i++)
    {
     
      try{
        if(checking == 1){
          console.log(`Delay ${jeda_limit} detik karena LIMIT`)
          await delay(`${jeda_limit}000`)
          checking = 0;
        }
        if(i == tar_get.length - 1) 
        {
          enabled = 1
        }   
        const id = await ig.user.getIdByUsername(tar_get[i]);
        const userFeed = ig.feed.user(id);
        const myPostsFirstPage = await userFeed.items();
        fs.writeFileSync('./target/' + tar_get[i] + '.txt', myPostsFirstPage[0].id);
        console.log('Checking latest media_id', tar_get[i])
      }catch(err)
      {
        if(err.toString().includes('before you try again.')) checking = 1;
        console.log(tar_get[i], err.toString())
      }
      

    }

    if(enabled == 1)
    {
      while(true){
        if(starting == 1){
          console.log(`Delay ${jeda_limit} detik karena LIMIT`)
          await delay(`${jeda_limit}000`)
          starting = 0;
        }
        tar_get.map(async function(param, index)
        {
            try{
              var komen = GetRandomID(read_komen)
              const id = await ig.user.getIdByUsername(param);
              const userFeed = ig.feed.user(id);
              const myPostsFirstPage = await userFeed.items();
              const latest_id = myPostsFirstPage[0].id
              await delay(1500)
              await Execute(param, ig, komen, latest_id)
            }catch(err)
            {
              if(err.toString().includes('before you try again.')) starting = 1;
                console.log(err.toString())
            }
            
        })
        
        await delay(`${jeda}000`)
      }
    }

    

  }catch(err){
    console.log(err.toString())
  }

})();
