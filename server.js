const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
// Create a token generator with the default settings:
const randtoken = require("rand-token");
const app = express(); // 產生Express Application 物件
const port = 5000;

app.use(express.static("static"))
app.set("view engine", "ejs")

const pool = require("./database")

// pages
app.get("/", (req, res) => {
  res.render("index")
})

// 設定 AWS 的訪問金鑰與區域
AWS.config.update({
  accessKeyId: process.env.AWS_accessKeyId,
  secretAccessKey: process.env.AWS_secretAccessKey
});

// 建立 S3 物件
const s3 = new AWS.S3();

// 設定 Multer
const upload = multer({
  storage: multer.memoryStorage()
});

let cloudFrontUrl;
app.post("/imageupload", upload.single("image"), async(req, res) => {
  try{
    // 取得上傳的照片
    const image = req.file;
    // 取得上傳的文字
    const messageText = req.body.messageText;
    if (messageText == ""){
      res.status(400).json({ 
        "error": true,
        "message": "留言處不能為空" 
      });
    }else if(image == null){
      res.status(400).json({ 			
        "error": true,
        "message": "未選擇圖片檔案" 
      });
    }else{
      // Generate a 32 character alpha-numeric token:
      const token = randtoken.generate(32);
      // 設定 S3 物件的參數
      const params = {
        Bucket: "peiprojectbucket",
        Key: "uploadImage/" + token,  // S3資料夾名稱 + 檔案名稱
        Body: image.buffer,       // 檔案內容
        ContentType: image.mimetype,  // 檔案類型
      };
      s3.upload(params, async(err, data) => {
        if (err) {
          res.status(500).json({ error: err });
        } else {;
          cloudFrontUrl = data.Location.replace("https://peiprojectbucket.s3.amazonaws.com","http://dle57qor2pt0d.cloudfront.net")
          cloudFrontUrl = cloudFrontUrl.replace("https://peiprojectbucket.s3.us-west-2.amazonaws.com","http://dle57qor2pt0d.cloudfront.net")
          const result = await pool.execute("INSERT INTO messages(message, image) VALUES(?, ?)", [messageText, cloudFrontUrl])
          res.status(200).json({ message: "Upload OK" });
        }
      });       
    }
  }catch{
    return res.status(500).json({ 			
      "error": true,
      "message": "伺服器內部錯誤" 
    })
  }
});

app.get("/imageupload", async(req, res) => {
  try{
    const [result] = await pool.query("SELECT * FROM messages ORDER BY id DESC")
    res.status(200).json(result);
  }catch{
    return res.status(500).json({ 			
      "error": true,
      "message": "伺服器內部錯誤" 
    })
  }
})

app.get("/imagenew", async(req, res) => {
  try{
    const [[result]] = await pool.query("SELECT * FROM messages ORDER BY id DESC LIMIT 1")
    res.status(200).json(result);
  }catch{
    return res.status(500).json({ 			
      "error": true,
      "message": "伺服器內部錯誤" 
    })
  }
})

app.listen(port, () => {
  console.log("伺服器已經啟動在 http://localhost:5000/");
})