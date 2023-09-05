const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist/store')));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods","GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  

// Connect to MongoDB
mongoose.connect('mongodb+srv://olgas:Yimi2081@mycluster.0uggfb9.mongodb.net/?retryWrites=true&w=majority', {
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(error => {
  console.error('MongoDB connection error:', error);
});

const postschema = new mongoose.Schema({
    image1: { type: String, required: true },
    image2: { type: String, required: true },
    texture: { type: String, required: true },
    info: { type: String, required: true },
    designer: { type: String, required: true },
    colors: { type: Array, required: true },
    sizes: { type: String, required: true },
    fabric: { type: String, required: true },
    details: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: String, required: true },
  });
  
const Post = mongoose.model('post', postschema);

const orderschema = new mongoose.Schema({
  fullname:{ type:String, required:true },
  adress:{ type:String, required:true },
  mobile:{ type:String, required:true },
  product:{ type:Array, required:true },
}) 
const Order = mongoose.model('order',orderschema)

module.exports = mongoose.connection;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './dist/store/assets');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

app.post('/addpost',upload.fields(
  [
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'texture', maxCount: 1 }
  ]
  ), (req,res)=>{
  console.log(req.body)  
  const post = new Post({
        image1:req.files['image1'][0].filename,
        image2:req.files['image2'][0].filename,
        texture:req.files['texture'][0].filename,
        info:req.body.info,
        designer:req.body.designer,
        colors:req.body.colors,
        sizes:req.body.sizes,
        fabric:req.body.fabric,
        details:req.body.details,
        quantity:req.body.quantity,
        price:req.body.price,
    })
    post.save()
  .then(savedUser => {
  })
  .catch(error => {
  });
})

app.get('/getpost', (req, res) => {
  console.log(req.body)
  Post.find()
    .then(docs => {
      res.json(docs);
      console.log(docs);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Error fetching posts' });
    });
});

  app.get('/getpostbyid/:id', (req, res) => {
    console.log(req.body)
    Post.find({_id:req.params.id})
      .then(docs => {
        res.send(docs);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error fetching posts');
      });
  });  

  app.post('/bag',async(req,res)=>{
    const idsArray = req.body;

  if (!Array.isArray(idsArray)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const result = await Post.find({ _id: { $in: idsArray } }).exec();

    return res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
  })

  app.post('/order',(req,res)=>{
  const order = new Order({
    fullname:req.body[0].fullname,
    adress:req.body[0].adress,
    mobile:req.body[0].mobile,
    product:req.body[1]
  })
  order.save()
  .then(savedUser => {
    
  })
  .catch(error => {
    console.log(error)
  });
  })

  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'dist/store') }, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  });
  

app.listen(process.env.PORT || 80,function(err){
    if(err){
        console.log(err)
    }
    else{
        console.log('server connected')
    }
})