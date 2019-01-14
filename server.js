const express = require ('express');
const shortid = require('shortid');
const mongo = require("mongodb").MongoClient;
const validUrl = require("valid-url");
const mongoose=require('mongoose');


const app=express();
app.use(express.static("public"));
const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
app.use('/public', express.static(process.cwd() + '/public'));
  
app.post('/new',(req,res)=>{
    
    const parameter=req.body.url;
    const shrt=shortid.generate();

    if (validUrl.isUri(parameter)) {
      mongo.connect(process.env.MONGO_URL, function(err, client) {
        if (err) throw err;
        let db = client.db("url");
        let urls = db.collection("urls");
        urls.insertOne({ _id: shrt, originalUrl: parameter });
        const object = { original_url: parameter, short_url: `${req.hostname}/${shrt}` };
      res.send(object);
        client.close();
        res.end();
      });
    } else {
      res.send({
        error:
          "Wrong url format, make sure you have a valid protocol and real site."
      });
      res.end();
    }

});

app.get('/:str',(req,res)=>{
 const parameter = req.params.str;
 
    mongo.connect(process.env.MONGO_URL, function(err, client) {
      if (err) throw err;
      let db = client.db("url");
      let urls = db.collection("urls");
      
      
      urls
        .find({ _id: parameter })
        .project({ _id: 0 })
        .toArray(function(err, results) {
          if (err) throw err;
        
          if (results.length==0) {
             
                res.send({
                  error:
                    "This url does not exist on the database."
                });
          } else {
              res.redirect(results[0].originalUrl);
          }

        
          client.close();
          
        });
    });

})

app.listen(3000);