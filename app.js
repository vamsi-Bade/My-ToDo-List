//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose=require('mongoose');
const _=require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoDB="mongodb+srv://admin-vamsi:test123@cluster0.fsbdals.mongodb.net/todolistDB";
mongoose.connect(mongoDB,{useNewUrlParser:true});

const itemSchema={
  name:String
};
const Item=mongoose.model("Item",itemSchema);
const item1={
  name:"Buy Food"
};
const item2={
  name:"Cook Food"
};
const item3={
  name:"Eat Food"
};
var defaultItemList=[item1,item2,item3];

defaultItemList=[item1,item2,item3];

const listSchema={
  name: String,
  items: [itemSchema]
};
const List= mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  
  Item.find({},function(err,items){
    if (err){
      console.log(err);
    }
    else{
      if(items.length==0){
        Item.insertMany(defaultItemList,function(err){
          if(err)
          console.log(err);
          else
          console.log("Inserted Successfully");
        })
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle:"Today", newListItems:items});
      }
    }
  })

});
app.get("/:customListName",function(req,res){
  const u=_.capitalize(req.params.customListName);
  var ls=List.findOne({name:u},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create the new list 
        const list = new List({
          name:u,
          items: defaultItemList
        });
        list.save();
        console.log(foundList);
        res.redirect("/"+u);
      }
      else{
        //Show the Existing list
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
   });
   
   if(listName==="Today"){
    item.save();
    res.redirect("/");
   }
   else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
   }

   
  
});
app.post("/delete",function(req,res){
  var it=req.body.checkbox;
  const listN=req.body.listName;
  if(listN==="Today"){
    Item.findByIdAndDelete(it,function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listN},{$pull:{items:{_id:it}}},function(err){
      if(!err){
        res.redirect("/"+listN);
      }
    })
  }
});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: defaultItemList});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
